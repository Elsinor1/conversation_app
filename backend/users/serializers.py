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

class LanguageLevelSerializerIn(serializers.ModelSerializer):
    """
    Input serializer for LanguageLevel - accepts IDs for foreign keys
    Used for POST/PUT requests
    """
    language = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all())
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    user = serializers.PrimaryKeyRelatedField(read_only=True)  # Set from request.user in view

    class Meta:
        model = LanguageLevel
        fields = (
            "id",
            "user",
            "language",
            "level", 
            "progress"
        )
        read_only_fields = ("id", "user")  # User is set from request, id is auto-generated


class LanguageLevelSerializerOut(serializers.ModelSerializer):
    """
    Output serializer for LanguageLevel - returns nested objects
    Used for GET requests
    """
    language = LanguageSerializer(read_only=True)
    level = LevelSerializer(read_only=True)

    class Meta:
        model = LanguageLevel
        fields = (
            "id",
            "user",
            "language",
            "level", 
            "progress"
        )
        read_only_fields = ("id", "user", "language", "level", "progress")


# Alias for backward compatibility - use specific In/Out serializers in views
LanguageLevelSerializer = LanguageLevelSerializerOut    
  
