"""URL configuration for vocabulary app."""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vocabulary'

# Router for viewset-based views
router = DefaultRouter()
router.register(r'vocabulary-word', views.GeneralVocabularyWordViewSet, basename='vocabulary-word')
router.register(r'user-vocabulary-word', views.UserVocabularyWordViewSet, basename='user-vocabulary-word')
router.register(r'vocabulary-list', views.VocabularyListViewSet, basename='vocabulary-list')
router.register(r'user-vocabulary-word-status', views.UserVocabularyWordStatusViewSet, basename='user-vocabulary-word-status')
router.register(r'vocabulary-practice', views.VocabularyPracticeViewSet, basename='vocabulary-practice')

urlpatterns = router.urls

