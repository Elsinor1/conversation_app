import os
import tempfile
import threading
import azure.cognitiveservices.speech as speechsdk
from django.core.files.uploadedfile import TemporaryUploadedFile, InMemoryUploadedFile, UploadedFile
import dotenv
from datetime import datetime
import uuid
dotenv.load_dotenv()


def save_audio_to_file(audio_file: UploadedFile, filename: str = None):
    if filename is None:
        filename = f'speech/speech_records/input/{datetime.now().strftime("%Y%m%d_%H%M%S")}_{uuid.uuid4().hex[:8]}.wav'
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        for chunk in audio_file.chunks():
            f.write(chunk)
    print(f"Saved audio to: {filename}")
    return filename

def load_audio_from_file(filename):
    """
    Load audio file from file
    """
    with open(filename, 'rb') as f:
        return f.read()

def delete_audio_file(filename):
    """
    Delete audio file from file
    """
    os.remove(filename)


# def convert_audio_to_text(audio_file, language='en-US'):
#     """
#     Convert audio file to text
    
#     Why we need a temporary file:
#     1. Django's UploadedFile can be either:
#        - InMemoryUploadedFile (small files, stored in memory, no file path)
#        - TemporaryUploadedFile (large files, stored on disk, but Django manages it)
    
#     2. Azure Speech SDK's AudioConfig only accepts:
#        - filename= (string path to file on disk)
#        - It does NOT accept file objects, streams, or in-memory files
    
#     3. Even if TemporaryUploadedFile has a path, we create our own because:
#        - Django may delete it when request ends
#        - We need control over cleanup timing (after Azure SDK finishes)
#        - Ensures consistent behavior regardless of file size
    
#     Also saves input audio to speech/speech_records/input folder for record keeping.
#     """
#     import uuid
#     import shutil
#     from datetime import datetime
    
#     SPEECH_KEY = os.getenv('azure_speech_api_key')
#     AZURE_ENDPOINT = os.getenv('azure_speech_endpoint')
    
#     temp_file_path = None
#     created_our_temp_file = False
#     saved_input_file = None
#     try:
#         # Check if file is already on disk (TemporaryUploadedFile)
#         if isinstance(audio_file, TemporaryUploadedFile) and hasattr(audio_file, 'temporary_file_path'):
#             # File is already on disk, use its path directly
#             # Note: Django manages this file's lifecycle, don't delete it
#             temp_file_path = audio_file.temporary_file_path()
#             created_our_temp_file = False
#             print("temp file path 1: ", temp_file_path)
#         else:
#             # File is in memory (InMemoryUploadedFile) or we need our own copy
#             # Create temporary file to save uploaded audio
#             with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
#                 # Write audio file content to temp file
#                 for chunk in audio_file.chunks():
#                     temp_file.write(chunk)
#                 temp_file_path = temp_file.name
#                 created_our_temp_file = True
#                 print("temp file path 2: ", temp_file_path)
        
#         # Configure speech recognition
#         # print("creating speech config...")
#         # print("speech key: ", SPEECH_KEY)
#         # print("speech region: ", SPEECH_REGION)
#         # print("azure endpoint: ", AZURE_ENDPOINT)
#         speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, endpoint=AZURE_ENDPOINT)
#         # print("speech config: ", speech_config)
#         speech_config.speech_recognition_language = language
#         # print("speech recognition language: ", speech_config.speech_recognition_language)
#         # Use the temporary file path
#         # print("creating audio config...")
#         audio_config = speechsdk.audio.AudioConfig(filename=temp_file_path)
#         # print("audio config: ", audio_config)
#         # print("speech config: ", speech_config)
#         speech_recognizer = speechsdk.SpeechRecognizer(
#             speech_config=speech_config, 
#             audio_config=audio_config
#         )
#         # print("speech recognizer: ", speech_recognizer)
#         # Recognize speech
#         # print("recognizing speech...")
#         speech_recognition_result = speech_recognizer.start_continuous_recognition()
#         # print("speech recognition result: ", speech_recognition_result)
        
#         # Save input audio to speech/speech_records/input folder AFTER recognition (non-blocking)
#         # This way it doesn't interfere with the recognition process or file handles
#         try:
#             os.makedirs('speech/speech_records/input', exist_ok=True)
#             # Create unique filename with timestamp
#             input_filename = f'speech/speech_records/input/{datetime.now().strftime("%Y%m%d_%H%M%S")}_{uuid.uuid4().hex[:8]}.wav'
#             # Copy file to input folder (this shouldn't affect the original temp file)
#             shutil.copy2(temp_file_path, input_filename)
#             saved_input_file = input_filename
#             print(f"Saved input audio to: {input_filename}")
#         except Exception as save_error:
#             # Don't fail the whole operation if saving input file fails
#             print(f"Warning: Failed to save input audio file: {save_error}")
#             saved_input_file = None
        
#         # Check recognition results
#         if speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
#             raise Exception("No speech recognized")
#         if speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
#             cancellation_details = speech_recognition_result.cancellation_details
#             raise Exception(f"Speech recognition canceled: {cancellation_details.reason}")
#         return speech_recognition_result.text
#     except Exception as e:
#         raise Exception(f"Error converting audio to text: {str(e)}")
#     finally:
#         # Only delete if we created our own temp file (not Django's TemporaryUploadedFile)
#         # Django manages TemporaryUploadedFile lifecycle, so we don't delete those
#         if created_our_temp_file and temp_file_path and os.path.exists(temp_file_path):
#             try:
#                 os.unlink(temp_file_path)
#             except Exception:
                # pass  # Ignore cleanup errors

def convert_audio_to_text(audio_file_path, language='en-US'):
    """
    Convert audio file to text
    audio_file_path:str path to the audio file
    language:str language of the audio file
    """
    SPEECH_KEY = os.getenv('azure_speech_api_key')
    AZURE_ENDPOINT = os.getenv('azure_speech_endpoint')
    if not SPEECH_KEY or not AZURE_ENDPOINT:
        raise ValueError("Azure Speech API key or endpoint is not set")
   
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file does not exist: {audio_file_path}")
    
    if not os.path.isfile(audio_file_path) or not audio_file_path.endswith('.wav'):
        raise ValueError(f"Audio file is not a WAV file: {audio_file_path}")
    
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, endpoint=AZURE_ENDPOINT)
    speech_config.speech_recognition_language = language
    audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)
    speech_recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config, 
        audio_config=audio_config
    )
    transcribed = False

    speech_recognition_result = speech_recognizer.start_continuous_recognition()
    print("speech recognition result: ", speech_recognition_result)
    print("speech recognition result reason: ", speech_recognition_result.reason)

    if speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
        raise Exception("No speech recognized")
    if speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_recognition_result.cancellation_details
        raise Exception(f"Speech recognition canceled: {cancellation_details.reason}")
    return speech_recognition_result.text
    
class SpeechRecognizer:
    def __init__(self, audio_file_path, language='en-US'):

        SPEECH_KEY = os.getenv('azure_speech_api_key')
        AZURE_ENDPOINT = os.getenv('azure_speech_endpoint')
        if not SPEECH_KEY or not AZURE_ENDPOINT:
            raise ValueError("Azure Speech API key or endpoint is not set")
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file does not exist: {audio_file_path}")
        if not os.path.isfile(audio_file_path) or not audio_file_path.endswith('.wav'):
            raise ValueError(f"Audio file is not a WAV file: {audio_file_path}")
        self.audio_file_path = audio_file_path
        self.language = language
        self.speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, endpoint=AZURE_ENDPOINT)
        self.speech_config.speech_recognition_language = language
        self.audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)
        self.speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config, audio_config=self.audio_config)
        self.transcribed = False
        self.transcribed_text = []  # List to collect transcribed text segments
        self.recognition_done = threading.Event()  # Event to signal recognition completion
        self.recognition_error = None  # Store any errors that occur
        self.recognition_stopped = False  # Flag to prevent multiple stops
        
        # Set up event handlers
        self.speech_recognizer.recognizing.connect(lambda evt: print('RECOGNIZING: {}'.format(evt)))
        self.speech_recognizer.recognized.connect(self.recognized_cb)  # Must connect to collect text!
        self.speech_recognizer.session_started.connect(lambda evt: print('SESSION STARTED: {}'.format(evt)))
        self.speech_recognizer.session_stopped.connect(self.session_stopped_cb)  # Must connect to signal completion!
        self.speech_recognizer.canceled.connect(self.canceled_cb)  # Must connect to handle EndOfStream!

    def recognized_cb(self, evt):
        """Callback for when speech is recognized"""
        if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
            text = evt.result.text
            if text:
                self.transcribed_text.append(text)
                print('RECOGNIZED: {}'.format(text))

        elif evt.result.reason == speechsdk.ResultReason.NoMatch:
            print('No speech could be recognized')
            # Don't stop on NoMatch - wait for actual recognition or cancellation
        
        self.recognition_done.set()
        self._stop_recognition()

    def transcribe(self):
        """Start continuous recognition and return transcribed text"""
        # Reset state
        self.transcribed_text = []
        self.recognition_done.clear()
        self.recognition_error = None
        self.recognition_stopped = False
        
        # Start continuous recognition
        self.speech_recognizer.start_continuous_recognition()
        
        # Wait for recognition to complete (blocking call)
        # The callbacks will set the event when done
        # Returns immediately when event is set, 30s is just max timeout
        event_set = self.recognition_done.wait(timeout=30)
        
        if not event_set:
            # Timeout occurred - this shouldn't happen normally
            print('Warning: Recognition wait timed out after 30 seconds')
            self._stop_recognition()
        
        # Ensure recognition is stopped
        if not self.recognition_stopped:
            self._stop_recognition()
        
        # Check for errors
        if self.recognition_error:
            raise self.recognition_error
        
        # Combine all transcribed segments
        full_text = ' '.join(self.transcribed_text).strip()
        
        if not full_text:
            raise Exception("No speech recognized")
        
        return full_text
       
    def canceled_cb(self, evt):
        """Callback for when recognition is canceled"""
        cancellation_details = evt.result.cancellation_details
        cancellation_reason = cancellation_details.reason
        
        print(f'CANCELED: reason={cancellation_reason}')
        
        if not self.recognition_stopped:
            # EndOfStream is NORMAL for file-based recognition - not an error!
            # This happens when the audio file ends - it's expected behavior
            if cancellation_reason == speechsdk.CancellationReason.EndOfStream:
                print('✓ Recognition ended normally (end of stream) - this is expected!')
                # Stop immediately for EndOfStream to avoid delays
                self._stop_recognition()
            elif cancellation_reason == speechsdk.CancellationReason.Error:
                # Only set error for actual errors
                error_details = cancellation_details.error_details or str(cancellation_reason)
                print(f'✗ Speech recognition error: {error_details}')
                if not self.recognition_error:
                    self.recognition_error = Exception(f"Speech recognition error: {error_details}")
                self._stop_recognition()
            else:
                print(f'⚠ Unknown cancellation reason: {cancellation_reason}')
                self._stop_recognition()
    
    def session_stopped_cb(self, evt):
        """Callback for when session stops"""
        print('SESSION STOPPED {}'.format(evt))
        # Only stop if not already stopped (canceled_cb might have already handled it)
        if not self.recognition_stopped:
            self._stop_recognition()
    
    def _stop_recognition(self):
        """Internal method to stop recognition and signal completion"""
        if self.recognition_stopped:
            return  # Already stopped
        
        self.recognition_stopped = True
        try:
            self.speech_recognizer.stop_continuous_recognition()
        except Exception as e:
            # Ignore errors if already stopped
            print(f'Note: Error stopping recognition (may already be stopped): {e}')
        
        # Signal that recognition is complete
        self.transcribed = True


def convert_text_to_audio(text, language='en-US', message_id=None):
    """
    Convert text to audio and save to file
    """
    SPEECH_KEY = os.getenv('azure_speech_api_key')
    AZURE_ENDPOINT = os.getenv('azure_speech_endpoint')
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, endpoint=AZURE_ENDPOINT)
    speech_config.speech_synthesis_language = language

    # The neural multilingual voice can speak different languages based on the input text.
    if language == 'en-US':
        speech_config.speech_synthesis_voice_name = 'en-US-Ava:DragonHDLatestNeural'
    elif language == 'de-DE':
        speech_config.speech_synthesis_voice_name = 'de-DE-StefanNeural'

    # Create unique filename if message_id is provided
    if message_id:
        filename = f'speech/speech_records/output_{message_id}.wav'
    else:
        filename = 'speech/speech_records/output.wav'
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Use AudioConfig with filename to save to file (not AudioOutputConfig which plays to speaker)
    audio_config = speechsdk.audio.AudioConfig(filename=filename)
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
    
    speech_synthesis_result = speech_synthesizer.speak_text_async(text).get()

    if speech_synthesis_result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized for text [{}]".format(text))
        return filename
    elif speech_synthesis_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_synthesis_result.cancellation_details
        print("Speech synthesis canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            if cancellation_details.error_details:
                print("Error details: {}".format(cancellation_details.error_details))
                print("Did you set the speech resource key and endpoint values?")
        raise Exception(f"Speech synthesis canceled: {cancellation_details.reason}")
    else:
        raise Exception("Speech synthesis failed")
