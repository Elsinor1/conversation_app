# conversation_app/routing.py
from django.urls import re_path

from chatbots import consumers as chatbot_consumers

websocket_urlpatterns = [
    re_path(r'ws/audio-stream/', chatbot_consumers.AudioStreamConsumer.as_asgi()),
]