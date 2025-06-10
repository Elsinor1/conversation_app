import azure.cognitiveservices.speech as speechsdk
import tempfile
from dotenv import load_dotenv
import os
import json
from typing import Callable
import asyncio
import time
load_dotenv()


class WebSocketSender:
    def __init__(self, send_callback):
        self.send_callback = send_callback  # Save the send callback for later use

    # def send(self, message):
    #     # Use the send callback to send the message asynchronously
    #     print("asyncio.create_task(self.send_callback(text_data=message))")
    #     asyncio.create_task(self.send_callback(text_data=message))

    def send(self, message):
        # Use the send callback to send the message asynchronously
        print(f"asyncio.create_task(self.send_callback(text_data={message}))")
        self.send_callback(text_data=message)
    
    # def schedule_send_message(self, message):
    #     # Schedule sending the message using asyncio.create_task
    #     print("schedule_send_message", self.send_callback)
    #     asyncio.create_task(self.send_callback(message))
    #     # self.send(message)


class AzureSpeechToTextStream(WebSocketSender):
     # Azure credentials
    AZURE_SPEECH_KEY = os.environ.get("azure_speech_api_key")
    AZURE_SPEECH_REGION = os.environ.get("azure_speech_region")

    def __init__(self, send_callback):
        super().__init__(send_callback)
        self.recognized_text = ""
        speech_config = speechsdk.SpeechConfig(subscription=self.AZURE_SPEECH_KEY, region=self.AZURE_SPEECH_REGION)
        # current_directory = os.path.dirname(os.path.abspath(__file__))
        # log_file_path = os.path.join(current_directory, "bot.log")
        # speech_config.set_property(speechsdk.PropertyId.Speech_LogFilename, log_file_path)
        self.stream = speechsdk.audio.PushAudioInputStream()
        audio_config = speechsdk.audio.AudioConfig(stream=self.stream)  
        self.speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        # Connect callbacks to the events fired by the speech recognizer
        self.speech_recognizer.recognizing.connect(self.on_recognizing)
        self.speech_recognizer.recognized.connect(self.on_recognized)
        self.speech_recognizer.session_started.connect(lambda evt: print('SESSION STARTED: {}'.format(evt)))
        self.speech_recognizer.session_stopped.connect(lambda evt: print('SESSION STOPPED {}'.format(evt)))
        self.speech_recognizer.canceled.connect(lambda evt: print('CANCELED {}'.format(evt)))
        self.transcription_complete = asyncio.Event() # Complete message transcribed

    def on_recognizing(self, evt):
        print('RECOGNIZING: {}'.format(evt.result.text))
        self.recognized_text = evt.result.text
        self.send(json.dumps({
            "text":evt.result.text,
            "type":"transcription"
        }))

    def on_recognized(self, evt):
        print('RECOGNIZED: {}'.format(evt.result.reason))
        self.transcription_complete.set()

        if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
            self.recognized_text = evt.result.text
            print("evt.result.reason == speechsdk.ResultReason.RecognizedSpeech")
            self.transcription_complete.set()  # Signal that transcription is complete
            self.send({
                "type": "transcription_complete",
                "text": evt.result.text
            })
            print('RECOGNIZED sent message')
        else:
            print('Recognition failed: {}'.format(evt.result.reason))

        

    def start_recognition(self):
        self.speech_recognizer.start_continuous_recognition()


    def stop_recognition(self):
        self.speech_recognizer.stop_continuous_recognition()
        self.stream.close()


    # async def transcribe_audio(self, audio_chunk: bytes):
    #     print("transcribe audio writing")
        
    #     # Clear the transcription event to wait for the new transcription to complete
    #     self.transcription_complete.clear()
        
    #     # Write the audio chunk to the stream
    #     self.stream.write(audio_chunk)

    def transcribe_audio(self, audio_chunk: bytes):
        print("transcribe audio writing")
        
        # Write the audio chunk to the stream
        self.stream.write(audio_chunk)

    async def test_ws(self, audio_chunk: bytes):
        print("test_ws recieved")
        await self.send_callback(text_data=json.dumps({"message": f"test chunk {audio_chunk}"}))
        


class AzureSpeechToTextOnce():
     # Azure credentials
    AZURE_SPEECH_KEY = os.environ.get("azure_speech_api_key")
    AZURE_SPEECH_REGION = os.environ.get("azure_speech_region")

    def __init__(self):
        self.recognized_text = ""
        speech_config = speechsdk.SpeechConfig(subscription=self.AZURE_SPEECH_KEY, region=self.AZURE_SPEECH_REGION)
        self.stream = speechsdk.audio.PushAudioInputStream()
        audio_config = speechsdk.audio.AudioConfig(stream=self.stream)  
        self.speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        
    async def transcribe_audio(self, audio_chunk: bytes):
        self.stream.write(audio_chunk)
        self.stream.close()
        result = self.speech_recognizer.recognize_once_async().get()
        print("recognize once async called", result)
        return result
    