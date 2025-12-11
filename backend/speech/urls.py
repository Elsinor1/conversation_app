from .views import SpeechToTextView, VoiceSampleView

from django.urls import path


urlpatterns = [
    path('speech-to-text/', SpeechToTextView.as_view(), name='speech-to-text'),
    path('voice-sample/', VoiceSampleView.as_view(), name='voice-sample'),
]
