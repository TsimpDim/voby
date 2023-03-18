from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import VClass, Set
from .serializers import ClassSerializer, SetSerializer

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
