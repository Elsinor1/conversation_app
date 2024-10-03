from .models import Chat
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
            "theme",
            "scenario",
            "language_level"
        )


class ChatMessagesSerializer(serializers.Serializer):
    """
    Serializer for validating chat_id
    """
    chat_id = serializers.CharField(max_length=16)
    message = serializers.CharField(max_length=500, required=False)

    def validate_chat_id(self, id):
        """"
        Validates that chat_id exists in the database
        """
        if not Chat.objects.get(pk=id):
            raise serializers.ValidationError("Chat ID does not exists in the DB")
        return id