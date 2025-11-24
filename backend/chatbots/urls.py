"""URL configuration for chatbots app."""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'chatbots'

# Router for viewset-based views
router = DefaultRouter()
router.register(r'chat', views.ChatAPIVIewSet, basename='chat')

urlpatterns = [
    path('chat_message/', views.ChatMessagesAPIView.as_view(), name='chat-message'),
    path('chat/<str:chat_id>/messages/', views.ChatMessagesAPIView.as_view(), name='chat-messages-history'),
]

urlpatterns += router.urls

