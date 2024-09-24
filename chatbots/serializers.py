from .models import Chat
from rest_framework.serializers import ModelSerializer
from rest_framework_json_api.serializers import PrimaryKeyRelatedField
from conversations.models import Theme, Scenario



class ChatModelSerializer(ModelSerializer):
    theme = PrimaryKeyRelatedField(queryset=Theme.objects.all(), many=False)
    scenario = PrimaryKeyRelatedField(queryset=Scenario.objects.all(), many=False)

    class Meta():
        model = Chat
        fields = (
            "theme",
            "scenario"
        )