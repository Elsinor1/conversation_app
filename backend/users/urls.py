"""URL configuration for users app."""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'users'

# Router for any viewset-based views (if we add them later)
router = DefaultRouter()

urlpatterns = [
    path('register/', views.UserAPIViews.as_view(), name='register'),
    path('dashboard-stats/', views.DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('language_level/', views.LanguageLevelsAPIView.as_view(), name='language-level-list'),
    path('language_level/<uuid:pk>/', views.LanguageLevelsAPIView.as_view(), name='language-level-detail'),
    path('languages/', views.LanguagesAPIView.as_view(), name='languages'),
    path('levels/', views.LevelsAPIView.as_view(), name='levels'),
]

urlpatterns += router.urls

