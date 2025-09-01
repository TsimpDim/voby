from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.http import HttpResponse
from .models import VClass, Set, Word, Example, QuizAnswer, Profile, TestAttempt, UserShortcuts, Translation, \
    Option, Tag
from .serializers import ClassSerializer, SetInfoSerializer, WordInfoSerializer, ExampleSerializer, \
    ProfileSerializer, QuizAnswerSerializer, TestQuestionSerializer, TestAttemptSerializer, \
    UserShortcutsSerializer, TranslationSerializer, GermanNounTestQuestionSerializer, OptionSerializer, \
    SetAllSerializer, WordAllSerializer, TagSerializer, RelatedWordSerializer, TranslationResultSerializer
from random import sample
from .aws import Aws
from .permissions import HasAIEnabled
from .constants import LANGUAGE_CODES
import requests, xlwt, os

class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 999

class ClassViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ClassSerializer
    queryset = VClass.objects.all().order_by('id')

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
        return VClass.objects.filter(user_id=self.request.user.id)

class SetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SetAllSerializer
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
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SetInfoSerializer
        else:
            return SetAllSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['sort'] = self.request.query_params.get('sort')
        return context

class WordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WordAllSerializer
    queryset = Word.objects.all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'sets__vclass': ['exact'],
        'sets': ['exact'],
        'word': ['icontains'],
        'tags__id': ['exact'],
        'favorite': ['exact']
    }
    ordering_fields = ['created']
    pagination_class = StandardPagination

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
        return Word.objects.filter(user_id=self.request.user.id).distinct()
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            if self.request.query_params.get('related') == 'true':
                return RelatedWordSerializer
            else:
                return WordInfoSerializer
        else:
            return WordAllSerializer

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
    
class TagViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer
    queryset = Tag.objects.all().order_by('id')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'vclass__id': ['exact'],
    }

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
        return Tag.objects.filter(user_id=self.request.user.id)
    
    @action(methods=['put'], detail=True, url_path=r'remove/(?P<word_id>[^/.]+)')
    def remove(self, request, pk=None, word_id=None):
        Tag.objects.get(id=pk).word.remove(word_id)
        return Response({}, status=status.HTTP_200_OK)

    @action(methods=['put'], detail=True, url_path=r'add/(?P<word_id>[^/.]+)')
    def add(self, request, pk=None, word_id=None):
        Tag.objects.get(id=pk).word.add(word_id)
        return Response({}, status=status.HTTP_200_OK)

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
        random = self.request.query_params.get('random')

        if not amount: amount = 1

        filter_kwargs = {
            'user': user,
        }

        if random == 'true':
            all_ids = list(Word.objects.values_list('id', flat=True))
        else:
            if favorites_only == 'true':
                filter_kwargs['favorite'] = True

            if set_id != -1 and class_id != -1:
                filter_kwargs['sets__id'] = set_id
                filter_kwargs['sets__vclass_id'] = class_id
            elif set_id == -1 and class_id != -1:
                filter_kwargs['sets__vclass_id'] = class_id
            else:
                filter_kwargs['sets__isnull'] = False

            all_ids = list(Word.objects.filter(**filter_kwargs).values_list('id', flat=True))
        amount = min(len(all_ids), amount)

        random_ids = sample(all_ids, amount)
        random_words = Word.objects.filter(id__in=random_ids).distinct()
        data = TestQuestionSerializer(random_words, many=True).data

        return Response(data, status=status.HTTP_200_OK)
    
class GenerateExampleView(APIView):
    permission_classes = [IsAuthenticated, HasAIEnabled]

    def post(self, request, format=None):
        user = self.request.user
        class_id = int(self.request.data.get("classId"))
        word_id = int(self.request.data.get("wordId"))

        vclass = VClass.objects.get(id=class_id)
        word = Word.objects.get(id=word_id)

        response = Aws.invoke(
            Aws.get_word_example_prompt(
                word.word,
                vclass.source_language,
                vclass.target_language
            ),
            Aws.AWS_RESPONSE_MAX_TOKEN_EXAMPLES
        )

        examples_created = []
        if 'examples' in response and len(response['examples']) > 0:
            for example in response['examples']:
                new_example = Example.objects.create(
                    text=example['text'],
                    translation=example['translation'],
                    user=user
                )
                new_example.word.add(word)
                examples_created.append(new_example)

        return Response(ExampleSerializer(examples_created, many=True).data, status=status.HTTP_200_OK)

class GenerateWordsView(APIView):
    permission_classes = [IsAuthenticated, HasAIEnabled]

    def post(self, request, format=None):
        user = self.request.user
        set_id = int(self.request.data.get("setId"))

        set = Set.objects.get(id=set_id)
        vclass = set.vclass

        response = Aws.invoke(
            Aws.get_words_prompt(
                set.name,
                vclass.source_language,
                vclass.target_language
            ),
            Aws.AWS_RESPONSE_MAX_TOKEN_WORDS
        )

        words_created = []
        if 'words' in response and len(response['words']) > 0:
            for word in response['words']:
                new_word = Word.objects.create(
                    word=word['word'],
                    plural=word['plural'],
                    user=user
                )
                new_word.sets.add(set)
                
                Translation.objects.create(
                    value=word['translation'],
                    word=new_word
                )
                words_created.append(new_word)

        return Response(WordAllSerializer(words_created, many=True).data, status=status.HTTP_200_OK)

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
            filter_kwargs['sets__id'] = set_id
            filter_kwargs['sets__vclass_id'] = class_id
        elif set_id == -1 and class_id != -1:
            filter_kwargs['sets__vclass_id'] = class_id
        else:
            filter_kwargs['sets__isnull'] = False

        filter_kwargs['word__regex'] = r'^([dD]er [A-Z][a-z]+)$|^([dD]ie [A-Z][a-z]+)$|^([dD]as [A-Z][a-z]+)$'
        all_ids = list(Word.objects.filter(**filter_kwargs).values_list('id', flat=True))
        amount = min(len(all_ids), amount)

        random_ids = sample(all_ids, amount)
        random_words = Word.objects.filter(id__in=random_ids).distinct()
        data = GermanNounTestQuestionSerializer(random_words, many=True).data

        return Response(data, status=status.HTTP_200_OK)

class WordTranslation(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        text = self.request.query_params.get("text")
        vclass_id = self.request.query_params.get("classId")

        vclass = VClass.objects.get(id=vclass_id)
        source_language = vclass.source_language.lower()
        target_language = vclass.target_language.lower()

        source_code = LANGUAGE_CODES[source_language]
        target_code = LANGUAGE_CODES[target_language]

        response = requests.post(f"{os.getenv('TRANSLATION_API_URL')}/translate", data={
            'q': text,
            'source': source_code,
            'target': target_code,
            'alternatives': 1,
            'format': 'text'
        })

        json_data = response.json()
        return Response(TranslationResultSerializer(json_data).data, status=status.HTTP_200_OK)

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

        columns = ['word', 'translations', 'plural', 'favorite', 'general', 'examples', 'example_translations', 'sets']

        for col_num in range(len(columns)):
            ws.write(row_num, col_num, columns[col_num], font_style)

        # Sheet body, remaining rows
        font_style = xlwt.XFStyle()

        rows = Word.objects.filter(user=user.id, sets__vclass_id=class_id).values_list('word', 'translations', 'plural', 'favorite', 'general', 'examples__text','examples__translation', 'sets__name')
        for row in rows:
            row_num += 1
            for col_num in range(len(row)):
                ws.write(row_num, col_num, row[col_num], font_style)

        wb.save(response)
        return response
    
class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all().order_by('id')

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
    queryset = UserShortcuts.objects.all().order_by('id')

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


class OptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # class_id = int(self.request.query_params.get("classId"))
        user = self.request.user
        options = Option.objects.filter(user=user)

        return Response(
            OptionSerializer(options, many=True).data,
            status=status.HTTP_200_OK
        )
    
    def patch(self, request):
        user = self.request.user
        options = self.request.data['options']
        for key, value in options.items():
            try:
                existing_option = Option.objects.get(user=user, key=key)
                existing_option.value = value
                existing_option.save()
            except Option.DoesNotExist:
                Option.objects.create(user=user, key=key, value=value)

        return Response(status=status.HTTP_200_OK)
    
class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            'OK',
            status=status.HTTP_200_OK
        )
    