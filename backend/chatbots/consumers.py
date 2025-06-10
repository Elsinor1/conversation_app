from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
import json
from .speechbots import AzureSpeechToTextStream, AzureSpeechToTextOnce
import base64


# class AudioStreamConsumer(AsyncWebsocketConsumer):
        
#     async def send(self, *args, **kwargs):
#         # Call the parent class's send method
#         await super().send(*args, **kwargs)
#         print("WebSocket send called with:", args, kwargs)  # Log or print for debugging

#     async def connect(self):
#         await self.accept()

#         # Initialize the AzureSpeechToTextStream instance
#         self.speech_to_text = AzureSpeechToTextStream(send_callback=self.send)
#         # self.speech_to_text = AzureSpeechToTextOnce()
#         self.speech_to_text.start_recognition()

#     async def disconnect(self, close_code):
#         # Stop the recognition and clean up
#         self.speech_to_text.stop_recognition()
#         pass

#     async def receive(self, text_data=None, bytes_data=None):
#         audio_chunk = bytes_data
#         if audio_chunk:
#             # Convert the base64-encoded string back to binary audio data
#             print("bytes data", audio_chunk[0:10])
#             # Push the audio data to the Azure recognizer stream
#             transcription = await self.speech_to_text.transcribe_audio(audio_chunk)
#             # print(transcription.text)
#             # await self.send(json.dumps({"transcription":transcription.text}))
#         if text_data:
#             data = json.loads(text_data)
#             try:
#                 if data["type"] == "audio_end":
#                     self.speech_to_text.stream.close()
#                     print("awaiting transcription_complete")
#                     self.speech_to_text.transcription_complete.wait()
#                     print("transcription_complete awaited successfully")
#             except KeyError:
#                 pass
    # async def receive(self, text_data=None, bytes_data=None):
    #     # text_data_json = json.loads(text_data)
    #     # byte_data_json = json.loads(bytes_data)
    #     message = "test"
    #     print("reciever recieved", bytes_data, text_data)
    #     await self.send(text_data=json.dumps({"message": message}))

    
class AudioStreamConsumer(WebsocketConsumer):
        
    def send(self, *args, **kwargs):
        # Call the parent class's send method
        super().send(*args, **kwargs)
        print("WebSocket send called with:", args, kwargs)  # Log or print for debugging

    def connect(self):
        self.accept()

        # Initialize the AzureSpeechToTextStream instance
        self.speech_to_text = AzureSpeechToTextStream(send_callback=self.send)
        # self.speech_to_text = AzureSpeechToTextOnce()
        self.speech_to_text.start_recognition()

    def disconnect(self, close_code):
        # Stop the recognition and clean up
        print("Websocket disconnecting")
        self.speech_to_text.stop_recognition()


    def receive(self, text_data=None, bytes_data=None):
        audio_chunk = bytes_data
        if audio_chunk:
            # Convert the base64-encoded string back to binary audio data
            print("bytes data", audio_chunk[0:10])
            # Push the audio data to the Azure recognizer stream
            transcription = self.speech_to_text.transcribe_audio(audio_chunk)
            # print(transcription.text)
            # await self.send(json.dumps({"transcription":transcription.text}))
        if text_data:
            data = json.loads(text_data)
            try:
                if data["type"] == "audio_end":
                    print("Recieve stopping")
                    self.speech_to_text.stop_recognition()
                    print("awaiting transcription_complete")
                    self.speech_to_text.transcription_complete.wait()
                    print("transcription_complete awaited successfully")
                    print("sending", self.speech_to_text.recognized_text)
                    self.send(json.dumps({
                        "text":self.speech_to_text.recognized_text,
                        "type":"transcription_complete"
                    }))
            except KeyError:
                pass
    # def receive(self, text_data=None, bytes_data=None):
    #     # text_data_json = json.loads(text_data)
    #     # byte_data_json = json.loads(bytes_data)
    #     message = "test"
    #     print("reciever recieved", bytes_data, text_data)
    #     await self.send(text_data=json.dumps({"message": message}))