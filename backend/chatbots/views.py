from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, DestroyModelMixin
from json import JSONDecodeError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import JSONParser
from django.http import JsonResponse, FileResponse, Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
import os
from pathlib import Path

from .serializers import ChatModelSerializer, ChatMessagesSerializer, ChatMessageModelSerializer
from .models import Chat, ChatMessage as ChatMessageModel
from conversations.models import Theme, Scenario
from users.models import LanguageLevel
from .chatbots import ConversationBot
from speech.helpers import convert_text_to_audio

class ChatAPIVIewSet(
    GenericViewSet,
    RetrieveModelMixin,
    ListModelMixin,
    DestroyModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting chats
    """
    authentication_classes = [TokenAuthentication]
    permission_classes=(IsAuthenticated,)
    serializer_class = ChatModelSerializer
    renderer_classes = [JSONRenderer]
    parser_classes = [JSONParser]
    
    def get_queryset(self):
        """
        This view should return a list of all the Chats
        for the currently authenticated user.
        """
        user = self.request.user
        return Chat.objects.filter(user=user)
    

    def create(self, request):
        try:
            data = JSONParser().parse(request)
            serializer = ChatModelSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                language_level = LanguageLevel.objects.get(pk=data["language_level"])
                theme = Theme.objects.get(pk=data["theme"])
                scenario = Scenario.objects.get(pk=data["scenario"])
                user = request.user
                chat = Chat.objects.create(theme=theme, scenario=scenario, user=user, language_level=language_level)
                return Response(ChatModelSerializer(chat).data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except JSONDecodeError:
            return JsonResponse({"result": "error", "message": "Json decoding error"}, status=status.HTTP_400_BAD_REQUEST)
        

class ChatMessagesAPIView(APIView):
    """
    API View for communicating with chatbot
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


    def post(self, request):
        try:
            data = JSONParser().parse(request)
            serializer = ChatMessagesSerializer(data=data)
            if not serializer.is_valid(raise_exception=True):
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except JSONDecodeError:
            return JsonResponse({"result": "error", "message": "Json decoding error"}, status=status.HTTP_400_BAD_REQUEST)
        
        chat = Chat.objects.get(pk=data["chat_id"])
        chatbot = ConversationBot()

        # If it is first message of the Chat
        if not chat.is_started:
            chatbot_message = chatbot.start_chat(chat=chat)
            chat.is_started = True
            chat.save()
            # Return initial message with audio URL
            if chatbot_message:
                chatbot_message_content = chatbot_message.content
                chatbot_message_id = chatbot_message.id
                audio_file_path = convert_text_to_audio(chatbot_message_content, message_id=str(chatbot_message_id))
                if not audio_file_path:
                    return Response({"result": "error", "message": "Failed to generate audio file"}, status=status.HTTP_400_BAD_REQUEST)
                audio_url = f"/api/chat/message/{chatbot_message_id}/audio/"
                return Response({
                    "result": "success",
                    "message": chatbot_message_content,
                    "audio_url": audio_url
                }, status=status.HTTP_200_OK)
        else:
            # If chat is started, message is mandatory
            if "message" not in data.keys() or data["message"] == "":
                return JsonResponse({
                    "result":"error", 
                    "message":"'message' not in data. Chat has already started, message is then mandatory."
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            chatbot_message = chatbot.continue_chat(chat=chat, human_message=data["message"])
            if chatbot_message:
                chatbot_message_content = chatbot_message.content
                # Generate audio file with message ID for unique filename
                audio_file_path = convert_text_to_audio(chatbot_message_content, message_id=str(chatbot_message.id))
                if not audio_file_path:
                    return Response({"result": "error", "message": "Failed to generate audio file"}, status=status.HTTP_400_BAD_REQUEST)
                # Return JSON with message and audio URL
                chatbot_message_id = chatbot_message.id
                audio_url = f"/api/chat/message/{chatbot_message_id}/audio/"
                
                return Response({
                    "result": "success",
                    "message": chatbot_message_content,
                    "audio_url": audio_url
                }, status=status.HTTP_200_OK)
            else:
                return Response({"result": "error", "message": "Failed to continue chat"}, status=status.HTTP_400_BAD_REQUEST)

class ChatMessageHistoryAPIView(APIView):
    """
    API View for getting message history for a specific chat
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]
    parser_classes = [JSONParser]

    def get(self, request, chat_id):
        """
        Get message history for a given chat_id from URL parameter
        """
        try:
            # Verify chat exists and belongs to user
            try:
                chat = Chat.objects.get(pk=chat_id, user=request.user)
            except Chat.DoesNotExist:
                return JsonResponse({
                    "result": "error",
                    "message": "Chat not found or access denied"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get messages for this chat, ordered by creation time
            messages = ChatMessageModel.objects.filter(chat=chat).order_by('created')
            
            serializer = ChatMessageModelSerializer(messages, many=True)
            
            # Transform to match frontend format: { role, text }
            formatted_messages = []
            for msg_data in serializer.data:
                formatted_messages.append({
                    'role': msg_data.get('role', 'assistant'),
                    'text': msg_data.get('text') or msg_data.get('content', '')
                })
            # print(formatted_messages)
            return Response(formatted_messages, status=status.HTTP_200_OK)
            
        except Exception as e:
            return JsonResponse({
                "result": "error",
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatMessageAudioAPIView(APIView):
    """
    API View for serving audio files for chat messages
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, message_id):
        """
        Get audio file for a specific chat message
        """
        try:
            # Get the message and verify it belongs to the authenticated user
            try:
                message = ChatMessageModel.objects.get(pk=message_id, chat__user=request.user)
            except ChatMessageModel.DoesNotExist:
                return JsonResponse({
                    "result": "error",
                    "message": "Message not found or access denied"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get audio file path (file should be saved with message ID)
            # Construct the expected file path based on how convert_text_to_audio saves files
            base_dir = Path(__file__).resolve().parent.parent
            audio_file_path = base_dir / 'speech' / 'speech_records' / f'output_{message_id}.wav'
            
            # Check if file exists
            if audio_file_path.exists():
                return FileResponse(
                    open(audio_file_path, 'rb'),
                    content_type='audio/wav',
                    filename=f'message_{message_id}.wav',
                    as_attachment=False
                )
            else:
                # If file doesn't exist, try to generate it (fallback)
                try:
                    audio_file_path_str = convert_text_to_audio(message.content, message_id=str(message_id))
                    if audio_file_path_str and os.path.exists(audio_file_path_str):
                        return FileResponse(
                            open(audio_file_path_str, 'rb'),
                            content_type='audio/wav',
                            filename=f'message_{message_id}.wav',
                            as_attachment=False
                        )
                except Exception:
                    pass
                
                return JsonResponse({
                    "result": "error",
                    "message": "Audio file not found"
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return JsonResponse({
                "result": "error",
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)