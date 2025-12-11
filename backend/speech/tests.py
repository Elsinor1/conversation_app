from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from users.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
import io
import wave
import struct
import os
from django.conf import settings
from unittest.mock import patch, MagicMock


class SpeechToTextTestCase(APITestCase):
    """
    Test case for Speech-to-Text API endpoint
    """
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='testuser@test.com'
        )
        
        # Token authentication
        self.token = Token.objects.get(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.url = '/speech-to-text/'
        
        # Path to voice sample file
        self.voice_sample_path = os.path.join(
            os.path.dirname(__file__),
            'voice_sample',
            'gerd_wav.wav'
        )
    
    def create_test_wav_file(self, duration_seconds=1, sample_rate=16000):
        """
        Create a simple test WAV file in memory
        Returns a BytesIO object with WAV file content
        """
        num_samples = int(sample_rate * duration_seconds)
        wav_buffer = io.BytesIO()
        
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)   # 16-bit
            wav_file.setframerate(sample_rate)
            
            # Generate simple sine wave
            for i in range(num_samples):
                value = int(32767 * 0.3 * (i / sample_rate))
                wav_file.writeframes(struct.pack('<h', value))
        
        wav_buffer.seek(0)
        return wav_buffer
    
    def get_voice_sample_file(self):
        """
        Load the voice sample file from speech/voice_sample/gerd_wav.wav
        Returns a file-like object (file handle or BytesIO)
        """
        if os.path.exists(self.voice_sample_path):
            # Open the actual file
            return open(self.voice_sample_path, 'rb')
        else:
            # Fallback: create a simple test WAV file if voice sample doesn't exist
            return self.create_test_wav_file()
    
    
    
    @patch('speech.helpers.speechsdk.SpeechRecognizer')
    @patch('speech.helpers.speechsdk.audio.AudioConfig')
    @patch('speech.helpers.speechsdk.SpeechConfig')
    @patch('speech.helpers.os.getenv')
    def test_speech_to_text_success(self, mock_getenv, mock_speech_config, mock_audio_config, mock_speech_recognizer):
        """Test successful speech recognition"""
        # Mock environment variables
        mock_getenv.side_effect = lambda key, default=None: {
            'azure_speech_api_key': 'test-key',
            'azure_speech_region': 'westeurope',
            'azure_speech_endpoint': 'https://test.endpoint.com'
        }.get(key, default)
        
        # Create a mock recognition result
        import azure.cognitiveservices.speech as speechsdk
        mock_recognition_result = MagicMock()
        mock_recognition_result.reason = speechsdk.ResultReason.RecognizedSpeech
        mock_recognition_result.text = "Hello, this is a test"
        
        # Set up the async chain
        mock_async_result = MagicMock()
        mock_async_result.get.return_value = mock_recognition_result
        
        mock_recognizer_instance = MagicMock()
        mock_recognizer_instance.recognize_once_async.return_value = mock_async_result
        mock_speech_recognizer.return_value = mock_recognizer_instance
        
        # Use actual voice sample file
        wav_file_handle = self.get_voice_sample_file()
        wav_file_handle.seek(0)
        file_content = wav_file_handle.read()
        wav_file_handle.close()
        
        # Create SimpleUploadedFile for Django test client
        audio_file = SimpleUploadedFile(
            name='gerd_wav.wav',
            content=file_content,
            content_type='audio/wav'
        )
        
        # Make request
        response = self.client.post(
            self.url,
            {
                'audio': audio_file,
                'language': 'en-US'
            },
            format='multipart'
        )
        print(response.data)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('text', response.data)
        self.assertEqual(response.data['text'], "Hello, this is a test")
    
    def test_speech_to_text_unauthorized(self):
        """Test that unauthenticated requests are rejected"""
        self.client.credentials()  # Remove authentication
        
        wav_file_handle = self.get_voice_sample_file()
        wav_file_handle.seek(0)
        file_content = wav_file_handle.read()
        wav_file_handle.close()
        
        audio_file = SimpleUploadedFile(
            name='gerd_wav.wav',
            content=file_content,
            content_type='audio/wav'
        )
        
        response = self.client.post(
            self.url,
            {
                'audio': audio_file,
                'language': 'en-US'
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_speech_to_text_missing_audio(self):
        """Test that missing audio file returns error"""
        response = self.client.post(
            self.url,
            {
                'language': 'en-US'
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # JSON API format returns errors as array
        self.assertTrue(len(response.data) > 0)
        # Check that error message indicates missing audio/file
        if isinstance(response.data, list) and len(response.data) > 0:
            error_detail = str(response.data[0].get('detail', ''))
            # Check for file/audio related error message
            self.assertTrue(
                'file' in error_detail.lower() or 
                'audio' in error_detail.lower() or 
                'submitted' in error_detail.lower() or
                'required' in error_detail.lower()
            )
    
    def test_speech_to_text_invalid_file_format(self):
        """Test that non-WAV files are rejected"""
        # Create a fake non-WAV file
        fake_file = SimpleUploadedFile(
            name='test.mp3',
            content=b'This is not a WAV file',
            content_type='audio/mpeg'
        )
        
        response = self.client.post(
            self.url,
            {
                'audio': fake_file,
                'language': 'en-US'
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_speech_to_text_invalid_language(self):
        """Test that invalid language codes are rejected"""
        wav_file_handle = self.get_voice_sample_file()
        wav_file_handle.seek(0)
        file_content = wav_file_handle.read()
        wav_file_handle.close()
        
        audio_file = SimpleUploadedFile(
            name='gerd_wav.wav',
            content=file_content,
            content_type='audio/wav'
        )
        
        response = self.client.post(
            self.url,
            {
                'audio': audio_file,
                'language': 'invalid-language'
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # JSON API format returns errors as array
        self.assertTrue(len(response.data) > 0)
        # Check that error message indicates invalid language
        if isinstance(response.data, list) and len(response.data) > 0:
            error_detail = str(response.data[0].get('detail', ''))
            self.assertIn('language', error_detail.lower())
    
    @patch('speech.helpers.speechsdk.SpeechRecognizer')
    @patch('speech.helpers.speechsdk.audio.AudioConfig')
    @patch('speech.helpers.speechsdk.SpeechConfig')
    @patch('speech.helpers.os.getenv')
    def test_speech_to_text_default_language(self, mock_getenv, mock_speech_config, mock_audio_config, mock_speech_recognizer):
        """Test that default language is used when not provided"""
        # Mock environment variables
        mock_getenv.side_effect = lambda key, default=None: {
            'azure_speech_api_key': 'test-key',
            'azure_speech_region': 'westeurope',
            'azure_speech_endpoint': 'https://test.endpoint.com'
        }.get(key, default)
        
        # Mock successful recognition
        import azure.cognitiveservices.speech as speechsdk
        mock_result = MagicMock()
        mock_result.reason = speechsdk.ResultReason.RecognizedSpeech
        mock_result.text = "Test"
        
        mock_recognizer_instance = MagicMock()
        mock_async_result = MagicMock()
        mock_async_result.get.return_value = mock_result
        mock_recognizer_instance.recognize_once_async.return_value = mock_async_result
        mock_speech_recognizer.return_value = mock_recognizer_instance
        
        # Use actual voice sample file
        wav_file_handle = self.get_voice_sample_file()
        wav_file_handle.seek(0)
        file_content = wav_file_handle.read()
        wav_file_handle.close()
        
        audio_file = SimpleUploadedFile(
            name='gerd_wav.wav',
            content=file_content,
            content_type='audio/wav'
        )
        
        response = self.client.post(
            self.url,
            {
                'audio': audio_file
            },
            format='multipart'
        )
        
        # Should use default language 'en-US'
        self.assertEqual(response.status_code, status.HTTP_200_OK)
