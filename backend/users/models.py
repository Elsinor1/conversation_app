from django.db import models
from utils.model_abstracts import Model
from django_extensions.db.models import (
    TimeStampedModel,
    ActivatorModel,
)
from django.contrib.auth.models import User


class Language(Model):
    """
    users.Language
    Stores a single language.
    parameter:      name e.g. English
    """
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = "Languages"

    def __str__(self):
        return f"{self.name}"


class Level(Model):
    """
    Uses.Level 
    Describes language proficiency.
    parameters:     ABC_value: e.g. B1
                    name: e.g. Intermediate
    """
    ABC_value = models.CharField(max_length=2)
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = "Levels"

    def __str__(self):
        return f"{self.ABC_value}"


class LanguageLevel(Model):
    """
    users.LanguageLevel
    Stores language proficiency for a certain language.
    parameters:     language:model:users.Language
                    level:model:users.Level
                    user:model:User
    """
    language = models.ForeignKey(Language, on_delete=models.CASCADE, verbose_name="language")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, verbose_name="level")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="user")

    class Meta:
        verbose_name_plural = "Language levels"

    def __str__(self):
        return f"{self.user.username} : {self.language} {self.level}"
