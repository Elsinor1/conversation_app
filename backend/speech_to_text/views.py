from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import dotenv
import os
import tempfile
import azure.cognitiveservices.speech as speechsdk
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import SpeechToTextSerializer
dotenv.load_dotenv()



# Create your views here.
class SpeechToTextView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Changed from JSONParser to handle file uploads
    serializer_class = SpeechToTextSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid(raise_exception=True):
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        SPEECH_KEY = os.getenv('azure_speech_api_key')
        SPEECH_REGION = os.getenv('azure_speech_region', 'westeurope')  # Default region if not set
        AZURE_ENDPOINT = os.getenv('azure_speech_endpoint')
        language = serializer.validated_data.get('language', 'en-US')
        audio = serializer.validated_data['audio']
        
        # Create temporary file to save uploaded audio
        temp_file = None
        try:
            # Save uploaded file to temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                # Write audio file content to temp file
                for chunk in audio.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Configure speech recognition
            speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION, endpoint=AZURE_ENDPOINT)
            speech_config.speech_recognition_language = language
            
            # Use the temporary file path
            audio_config = speechsdk.audio.AudioConfig(filename=temp_file_path)
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )

            # Recognize speech
            speech_recognition_result = speech_recognizer.recognize_once_async().get()

            if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return Response({"text": speech_recognition_result.text}, status=status.HTTP_200_OK)
            elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
                return Response(
                    {"error": "No speech could be recognized", "details": speech_recognition_result.no_match_details},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = speech_recognition_result.cancellation_details
                return Response(
                    {"error": "Speech recognition canceled", "details": cancellation_details.reason},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response({"error": "Unknown error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            return Response(
                {"error": f"Error processing audio: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception:
                    pass  # Ignore cleanup errors