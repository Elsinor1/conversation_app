from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, DestroyModelMixin
from json import JSONDecodeError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import JSONParser
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response

from .serializers import ChatModelSerializer, ChatMessagesSerializer
from .models import Chat
from conversations.models import Theme, Scenario
from users.models import LanguageLevel
from .chatbots import ConversationBot

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
                chat.refresh_from_db()
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
        chatbot_message = chatbot.chat(chat=chat, human_message=data["message"])
        return Response(chatbot_message.message, status=status.HTTP_200_OK)