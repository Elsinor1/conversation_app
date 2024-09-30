from rest_framework.fields import CharField, EmailField
from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """Base serializer for default User model"""

    
    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password"
        )
        extra_kwargs = {'password': {'write_only': True}} # Ensures password won't be written as output from API

    def create(self, validated_data):

        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"]
        )