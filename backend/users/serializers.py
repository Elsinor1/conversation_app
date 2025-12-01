from rest_framework.fields import CharField, EmailField
from rest_framework import serializers
from .models import User, LanguageLevel, Language, Level


class UserSerializer(serializers.ModelSerializer):
    """Base serializer for default User model"""

    invitation_code = serializers.CharField(required=False)
    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "invitation_code"
        )
        extra_kwargs = {'password': {'write_only': True}} # Ensures password won't be written as output from API

    def create(self, validated_data):

        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"]
        )
class LanguageSerializer(serializers.ModelSerializer):
    """Serializer for Language model"""
    class Meta:
        model = Language
        fields = (
            "id",
            "name"
        )
class LevelSerializer(serializers.ModelSerializer):
    """Serializer for Level model"""
    class Meta:
        model = Level
        fields = (
            "id",
            "ABC_value",
            "name"
        )

class LanguageLevelSerializer(serializers.ModelSerializer):
    """Serializer for LanguageLevel model"""
    language = LanguageSerializer()
    level = LevelSerializer()

    class Meta:
        model = LanguageLevel
        fields = (
            "id",
            "user",
            "language",
            "level", 
            "progress"
        )    
  
