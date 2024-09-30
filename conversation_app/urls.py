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
from rest_framework.authtoken.views import obtain_auth_token

# Basic router
router = DefaultRouter()

# Registering view sets
router.register(r'theme', conversation_views.ThemeViewSet, basename='theme')
router.register(r'scenario', conversation_views.ScenarioViewSet, basename='scenario')
router.register(r'chat', chatbots_views.ChatAPIVIewSet, basename='chat')

# Defining endpoints from the router
urlpatterns = router.urls

# Additional endpoints
urlpatterns += [
    path('admin/', admin.site.urls),
    path('register/', users_views.UserAPIViews.as_view()), # User registration endpoint
    path('api-token-auth/', obtain_auth_token), # Endpoint for token authentication
]
