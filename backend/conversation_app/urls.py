"""conversation_app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from users import views as users_views 
from conversations import views as conversation_views
from chatbots import views as chatbots_views
from vocabulary import views as vocabulary_views
from rest_framework.authtoken.views import obtain_auth_token


# Basic router
router = DefaultRouter()

# Registering view sets
router.register(r'theme', conversation_views.ThemeViewSet, basename='theme')
router.register(r'scenario', conversation_views.ScenarioViewSet, basename='scenario') 
router.register(r'chat', chatbots_views.ChatAPIVIewSet, basename='chat')
router.register(r'vocabulary-words', vocabulary_views.GeneralVocabularyWordViewSet, basename='vocabulary-words')
router.register(r'user-vocabulary-words', vocabulary_views.UserVocabularyWordViewSet, basename='user-vocabulary-words')
router.register(r'vocabulary-lists', vocabulary_views.VocabularyListViewSet, basename='vocabulary-lists')
router.register(r'user-vocabulary-status', vocabulary_views.UserVocabularyWordStatusViewSet, basename='user-vocabulary-status')
router.register(r'vocabulary-practices', vocabulary_views.VocabularyPracticeViewSet, basename='vocabulary-practices') 
urlpatterns = router.urls

# Additional endpoints
urlpatterns += [
    path('admin/', admin.site.urls),
    path('register/', users_views.UserAPIViews.as_view()), # User registration endpoint
    path('api-token-auth/', obtain_auth_token), # Endpoint for token authentication
    path('chat_message/', chatbots_views.ChatMessagesAPIView.as_view()), # Getting response from chatbot
    path('dashboard-stats/', users_views.DashboardStatsAPIView.as_view()), # Dashboard statistics endpoint
    path('language_level/', users_views.LanguageLevelsAPIView.as_view()), # Language levels endpoint
    path('language_level/<uuid:pk>/', users_views.LanguageLevelsAPIView.as_view()), # Language level detail endpoint
    path('languages/', users_views.LanguagesAPIView.as_view()), # Available languages endpoint
    path('levels/', users_views.LevelsAPIView.as_view()), # Available levels endpoint
    path('practice-setup/', conversation_views.PracticeSetupAPIView.as_view()), # Practice setup data endpoint
]

# Defining endpoints from the router (after home route so it doesn't override '/')

