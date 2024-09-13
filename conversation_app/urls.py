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

# Basic router
router = DefaultRouter()

# Registering view sets
router.register(r'theme', conversation_views.ThemeViewSet, basename='theme')
router.register(r'scenario', conversation_views.ScenarioViewSet, basename='scenario')

# Defining endpoints from the router
urlpatterns = router.urls

# Additional endpoints
urlpatterns += [
    path('admin/', admin.site.urls),
    path('user/', users_views.UserAPIViews.as_view())
]
