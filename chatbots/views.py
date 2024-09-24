from rest_framework.views import APIView, viewse
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin, UpdateModelMixin, CreateModelMixin, DestroyModelMixin
from .models import Chat
from .serializers import ChatModelSerializer
from rest_framework.permissions import IsAuthenticated

class ChatAPIVIew(
    GenericViewSet,
    UpdateModelMixin,
    RetrieveModelMixin,
    ListModelMixin,
    CreateModelMixin,
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
    
    