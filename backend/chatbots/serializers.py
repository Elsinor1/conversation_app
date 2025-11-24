from .models import Chat, ChatMessage as ChatMessageModel
from rest_framework import serializers
from rest_framework_json_api.serializers import PrimaryKeyRelatedField
from conversations.models import Theme, Scenario
from users.models import LanguageLevel



class ChatModelSerializer(serializers.ModelSerializer):
    theme = PrimaryKeyRelatedField(queryset=Theme.objects.all(), many=False)
    scenario = PrimaryKeyRelatedField(queryset=Scenario.objects.all(), many=False)
    language_level = PrimaryKeyRelatedField(queryset=LanguageLevel.objects.all(), many=False)

    class Meta():
        model = Chat
        fields = (
            "id",
            "theme",
            "scenario",
            "language_level"
        )


class ChatMessagesSerializer(serializers.Serializer):
    """
    Serializer for validating chat_id
    """
    chat_id = PrimaryKeyRelatedField(queryset=Chat.objects.all(), many=False)
    message = serializers.CharField(max_length=500, write_only=True, required=False)

class ChatMessageModelSerializer(serializers.ModelSerializer):
    """
    Serializer for ChatMessage model
    """
    

    class Meta():
        model = ChatMessageModel
        fields = ("id", "chat", "content", "role")
        read_only_fields = ("id", "chat", "content", "role")