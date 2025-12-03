from .views import SpeechToTextView
from django.urls import path

urlpatterns = [
    path('api/speech-to-text/', SpeechToTextView.as_view(), name='speech-to-text'),
]
