"""URL configuration for conversations app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'conversations'

# Router for viewset-based views
router = DefaultRouter()
router.register(r'theme', views.ThemeViewSet, basename='theme')
router.register(r'scenario', views.ScenarioViewSet, basename='scenario')

urlpatterns = [
    path('practice-setup/', views.PracticeSetupAPIView.as_view(), name='practice-setup'),
]

urlpatterns += router.urls

