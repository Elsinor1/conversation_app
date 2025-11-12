"""URL configuration for vocabulary app."""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vocabulary'

# Router for viewset-based views
router = DefaultRouter()
router.register(r'vocabulary-words', views.GeneralVocabularyWordViewSet, basename='vocabulary-words')
router.register(r'user-vocabulary-word', views.UserVocabularyWordViewSet, basename='user-vocabulary-word')
router.register(r'vocabulary-practice', views.VocabularyPracticeViewSet, basename='vocabulary-practice')

urlpatterns = [
    path('vocabulary-list/', views.VocabularyListAPIView.as_view(), name='vocabulary-list'),
    path('vocabulary-list/<uuid:pk>/', views.VocabularyListAPIView.as_view(), name='vocabulary-list-detail'),
]

urlpatterns += router.urls