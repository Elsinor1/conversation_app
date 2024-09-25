from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, DestroyModelMixin
from .models import Chat
from conversations.models import Theme, Scenario
from json import JSONDecodeError
from .serializers import ChatModelSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response


class ChatAPIVIewSet(
    GenericViewSet,
    UpdateModelMixin,
    RetrieveModelMixin,
    ListModelMixin,
    DestroyModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting chats
    """
    
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
            if serializer.is_valid():
                theme = Theme.objects.get(pk=data["theme"])
                scenario = Scenario.objects.get(pk=data["scenario"])
                # User is selected from the request
                user = request.user
                chat = Chat.objects.create(theme=theme, scenario=scenario, user=user)
                return Response(ChatModelSerializer(chat).data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except JSONDecodeError:
            return JsonResponse({"result": "error", "message": "Json decoding error"}, status=status.HTTP_400_BAD_REQUEST)
        
    