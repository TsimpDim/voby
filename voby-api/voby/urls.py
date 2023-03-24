from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClassViewSet, SetViewSet, WordViewSet

router = DefaultRouter()
router.register(r"class", ClassViewSet, basename="class")
router.register(r"set", SetViewSet, basename="set")
router.register(r"words", WordViewSet, basename="word")

urlpatterns = [
    path("", include(router.urls)),
]
