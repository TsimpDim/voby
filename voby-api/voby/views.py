from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.http import HttpResponse
from .models import VClass, Set, Word, Example, QuizAnswer, Profile, TestAttempt, UserShortcuts, Translation
from .serializers import ClassSerializer, SetSerializer, WordSerializer, ExampleSerializer, \
    ProfileSerializer, QuizAnswerSerializer, TestQuestionSerializer, TestAttemptSerializer, \
    UserShortcutsSerializer, TranslationSerializer, GermanNounTestQuestionSerializer
from random import sample
import xlwt

class ClassViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ClassSerializer
    queryset = VClass.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
    
    @action(methods=['get'], detail=True)
    def all(self, request, pk=None):
        user = self.request.user.id
        sort_param = request.query_params.get('sort')
    
        queryset = Word.objects.filter(user=user, set__vclass=pk)
        serializer = WordSerializer(queryset, many=True)
        vclass_info = VClass.objects.values('name', 'source_language', 'target_language').get(id=pk)

        return Response({
            'words': sorted(serializer.data, key=lambda w: w['created'], reverse=sort_param=='date_desc'),
            'vclass_info': vclass_info
        }, status=status.HTTP_200_OK)


    def get_queryset(self):
        return VClass.objects.filter(user_id=self.request.user.id)

class SetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SetSerializer
    queryset = Set.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return Set.objects.filter(user_id=self.request.user.id)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['sort'] = self.request.query_params.get('sort')
        return context

class WordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WordSerializer
    queryset = Word.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        related_words = Word.objects.filter(id__in=[item['id'] for item in serializer.data['related_words']])
        for rw in related_words.all():
            rw.related_words.add(serializer.data['id'])
            rw.save()

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        related_words = Word.objects.filter(id__in=[item['id'] for item in serializer.data['related_words']])
        for rw in related_words.all():
            if serializer.data['id'] not in rw.related_words.all():
                rw.related_words.add(serializer.data['id'])
                rw.save()

        return Response(serializer.data)

    def get_queryset(self):
        return Word.objects.filter(user_id=self.request.user.id)

class ExampleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ExampleSerializer
    queryset = Example.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return Example.objects.filter(user_id=self.request.user.id)

class QuizAnswerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAnswerSerializer
    queryset = QuizAnswer.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return QuizAnswer.objects.filter(user_id=self.request.user.id)

class TestAttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TestAttemptSerializer
    queryset = TestAttempt.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return TestAttempt.objects.filter(user_id=self.request.user.id)

class TestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = self.request.user
        amount = int(self.request.query_params.get("amount"))
        class_id = int(self.request.query_params.get("classId"))
        set_id = int(self.request.query_params.get("setId"))
        favorites_only = self.request.query_params.get('favoritesOnly')

        if not amount: amount = 1

        filter_kwargs = {
            'user': user,
        }

        if favorites_only == 'true':
            filter_kwargs['favorite'] = True

        if set_id != -1 and class_id != -1:
            filter_kwargs['set__id'] = set_id
            filter_kwargs['set__vclass_id'] = class_id
        elif set_id == -1 and class_id != -1:
            filter_kwargs['set__vclass_id'] = class_id
        else:
            filter_kwargs['set__isnull'] = False

        all_ids = list(Word.objects.filter(**filter_kwargs).values_list('id', flat=True))
        amount = min(len(all_ids), amount)

        random_ids = sample(all_ids, amount)
        random_words = Word.objects.filter(id__in=random_ids).distinct()
        data = TestQuestionSerializer(random_words, many=True).data

        return Response(data, status=status.HTTP_200_OK)

class GermanNounTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = self.request.user
        amount = int(self.request.query_params.get("amount"))
        class_id = int(self.request.query_params.get("classId"))
        set_id = int(self.request.query_params.get("setId"))
        favorites_only = self.request.query_params.get('favoritesOnly')

        if not amount: amount = 1

        filter_kwargs = {
            'user': user,
        }

        if favorites_only == 'true':
            filter_kwargs['favorite'] = True

        if set_id != -1 and class_id != -1:
            filter_kwargs['set__id'] = set_id
            filter_kwargs['set__vclass_id'] = class_id
        elif set_id == -1 and class_id != -1:
            filter_kwargs['set__vclass_id'] = class_id
        else:
            filter_kwargs['set__isnull'] = False

        filter_kwargs['word__regex'] = r'^.*([dD]er [A-Z]).*$|^.*([dD]ie [A-Z]).*$|^.*([dD]as [A-Z]).*$'
        all_ids = list(Word.objects.filter(**filter_kwargs).values_list('id', flat=True))
        amount = min(len(all_ids), amount)

        random_ids = sample(all_ids, amount)
        random_words = Word.objects.filter(id__in=random_ids).distinct()
        data = GermanNounTestQuestionSerializer(random_words, many=True).data

        return Response(data, status=status.HTTP_200_OK)

class ClassExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, class_id: int):
        # class_id = int(self.request.query_params.get("classId"))
        user = self.request.user

        vclass = VClass.objects.get(user=user.id, id=class_id)
        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = f'attachment; filename="{vclass.name}.xls"'

        wb = xlwt.Workbook(encoding='utf-8')
        ws = wb.add_sheet(vclass.name)

        # Sheet header, first row
        row_num = 0

        font_style = xlwt.XFStyle()
        font_style.font.bold = True

        columns = ['word', 'translations', 'plural', 'favorite', 'general', 'examples', 'example_translations', 'set']

        for col_num in range(len(columns)):
            ws.write(row_num, col_num, columns[col_num], font_style)

        # Sheet body, remaining rows
        font_style = xlwt.XFStyle()

        rows = Word.objects.filter(user=user.id, set__vclass_id=class_id).values_list('word', 'translations', 'plural', 'favorite', 'general', 'examples__text','examples__translation', 'set__name')
        for row in rows:
            row_num += 1
            for col_num in range(len(row)):
                ws.write(row_num, col_num, row[col_num], font_style)

        wb.save(response)
        return response
    
class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return Profile.objects.filter(user_id=self.request.user.id)

class UserShortcutsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserShortcutsSerializer
    queryset = UserShortcuts.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return UserShortcuts.objects.filter(user_id=self.request.user.id)

class TranslationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TranslationSerializer
    queryset = Translation.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = self.request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return Translation.objects.filter(word__user_id=self.request.user.id)
