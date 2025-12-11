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

class ChatHistorySerializer(serializers.Serializer):
    """
    Serializer for ChatHistory model
    """
    chat_id = PrimaryKeyRelatedField(queryset=Chat.objects.all(), many=False)
    messages = ChatMessageModelSerializer(many=True, read_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter queryset by user if request is available in context
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            self.fields['chat_id'].queryset = Chat.objects.filter(user=request.user)

