from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import dotenv
import os
from pathlib import Path
from django.http import FileResponse, Http404
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import SpeechToTextSerializer
from .helpers import convert_audio_to_text, save_audio_to_file, SpeechRecognizer
dotenv.load_dotenv()



# Create your views here.
class SpeechToTextView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Changed from JSONParser to handle file uploads
    serializer_class = SpeechToTextSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            print(serializer.validated_data)
            file_path = save_audio_to_file(serializer.validated_data['audio'])
            recognizer = SpeechRecognizer(file_path, serializer.validated_data.get('language', 'en-US'))
            text = recognizer.transcribe()
            # text = convert_audio_to_text(serializer.validated_data['audio'], serializer.validated_data.get('language', 'en-US'))
            return Response({"text": text}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VoiceSampleView(APIView):
    """
    Endpoint to serve the test voice sample file
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get the path to the voice sample file
        base_dir = Path(__file__).resolve().parent
        sample_path = base_dir / 'voice_sample' / 'gerd_wav.wav'
        
        if not sample_path.exists():
            raise Http404("Voice sample file not found")
        
        return FileResponse(open(sample_path, 'rb'), content_type='audio/wav', filename='gerd_wav.wav')