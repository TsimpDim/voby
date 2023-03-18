from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClassViewSet, SetViewSet

router = DefaultRouter()
router.register(r"class", ClassViewSet, basename="class")
router.register(r"set", SetViewSet, basename="set")

urlpatterns = [
    path("", include(router.urls)),
]
