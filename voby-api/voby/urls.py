from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClassViewSet, SetViewSet, WordViewSet, ExampleViewSet

router = DefaultRouter()
router.register(r"classes", ClassViewSet, basename="class")
router.register(r"sets", SetViewSet, basename="set")
router.register(r"words", WordViewSet, basename="word")
router.register(r"examples", ExampleViewSet, basename="example")

urlpatterns = [
    path("", include(router.urls)),
]
