from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClassViewSet, SetViewSet, WordViewSet, \
     ExampleViewSet, TestView, QuizAnswerViewSet, ProfileViewSet, \
     TestAttemptViewSet, UserShortcutsViewSet, ClassExcelView, TranslationViewSet, \
     GermanNounTestView, OptionView
 
router = DefaultRouter()
router.register(r"classes", ClassViewSet, basename="class")
router.register(r"sets", SetViewSet, basename="set")
router.register(r"words", WordViewSet, basename="word")
router.register(r"examples", ExampleViewSet, basename="example")
router.register(r"quizanswer", QuizAnswerViewSet, basename="quizanswer")
router.register(r"testattempt", TestAttemptViewSet, basename="testattempt")
router.register(r"profile", ProfileViewSet, basename="profile")
router.register(r"usershortcuts", UserShortcutsViewSet, basename="usershortcuts")
router.register(r"translations", TranslationViewSet, basename="translations")

urlpatterns = [
    path("", include(router.urls)),
    path('test', TestView.as_view(), name="test"),
    path('options', OptionView.as_view(), name="options"),
    path('german/noun-test', GermanNounTestView.as_view(), name="german-noun-test"),
    path('class/<int:class_id>/download', ClassExcelView.as_view(), name='download_class')
]
