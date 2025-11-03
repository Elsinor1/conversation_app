"""URL configuration for vocabulary app."""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vocabulary'

# Router for viewset-based views
router = DefaultRouter()
router.register(r'vocabulary-words', views.GeneralVocabularyWordViewSet, basename='vocabulary-words')
router.register(r'user-vocabulary-words', views.UserVocabularyWordViewSet, basename='user-vocabulary-words')
router.register(r'vocabulary-lists', views.VocabularyListViewSet, basename='vocabulary-lists')
router.register(r'user-vocabulary-status', views.UserVocabularyWordStatusViewSet, basename='user-vocabulary-status')
router.register(r'vocabulary-practices', views.VocabularyPracticeViewSet, basename='vocabulary-practices')

urlpatterns = router.urls

