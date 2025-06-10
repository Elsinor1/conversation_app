from rest_framework import serializers
from .models import Theme, Scenario

class ThemeModelSerializer(serializers.ModelSerializer):

    class Meta():
        model = Theme
        fields = (
            'title',
            'description'
        )


class ScenarioModelSerializer(serializers.ModelSerializer):

    theme = serializers.PrimaryKeyRelatedField(queryset=Theme.objects.all(), many=False)
    class Meta():
        model = Scenario
        fields = (
            'title',
            'description',
            'theme'
        )
