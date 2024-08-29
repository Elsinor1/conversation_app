from . import models
from rest_framework.fields import CharField, EmailField
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Base serializer for User model"""

    username = CharField(required=True)
    email = EmailField(required=True)

    class Meta:
        model = models.User
        fields = (
            "username",
            "email",
        )