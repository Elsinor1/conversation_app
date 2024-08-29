from django.db import models
from utils.model_abstracts import Model
from django_extensions.db.models import (
    TimeStampedModel,
    ActivatorModel,
)

class User(
    TimeStampedModel,
    ActivatorModel,
    Model):

    class Meta:
        verbose_name_plural ="Users"

    email = models.EmailField(unique=True, verbose_name="Email")
    username = models.CharField(max_length=30, unique=True, verbose_name="Username")
