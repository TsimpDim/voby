from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .models import VClass, Set, Word, Example, TestAnswer, Profile
from .serializers import ClassSerializer, SetSerializer, WordSerializer, ExampleSerializer, ProfileSerializer, TestAnswerSerializer
from random import choice

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
        return Response(
            WordSerializer(Word.objects.filter(user=user, set__vclass=pk), many=True).data,
            status=status.HTTP_200_OK
        )

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

class TestAnswerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TestAnswerSerializer
    queryset = TestAnswer.objects.all()

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
        return TestAnswer.objects.filter(user_id=self.request.user.id)

class TestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = self.request.user

        all_ids = list(Word.objects.filter(user=user, set__isnull=False).values_list('id', flat=True))
        random_id = choice(all_ids)
        random_word = Word.objects.get(id=random_id)
        data = WordSerializer(random_word, many=False).data

        return Response(
            {
                'word': data['word'],
                'translation': data['translation']
            }, status=status.HTTP_200_OK
        )
    
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
