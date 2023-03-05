from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClassViewSet

router = DefaultRouter()
router.register(r"class", ClassViewSet, basename="class")

urlpatterns = [
    path("", include(router.urls)),
]
