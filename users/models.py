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
    """
    users.User
    Stores a user infromation.
    parameter:      email: email string
                    username: string
    """
    class Meta:
        verbose_name_plural ="Users"

    email = models.EmailField(unique=True, verbose_name="Emails")
    username = models.CharField(max_length=30, unique=True, verbose_name="Usernames")



class Language(Model):
    """
    users.Language
    Stores a single language.
    parameter:      name e.g. English
    """
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = "Languages"


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

class LanguageLevel(Model):
    """
    users.LanguageLevel
    Stores language proficiency for a certain language.
    parameters:     language:model:users.Language
                    level:model:users.Level
    """
    language = models.ForeignKey(Language, on_delete=models.CASCADE, verbose_name="languages")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, verbose_name="levels")

    class Meta:
        verbose_name_plural = "Language levels"


class Student(User):
    """
    users.Student
    Student model inherits from users.User. Adds langugage level info.
    parameters: language_level:model:users.LanguageLevel
    """
    language_level = models.ForeignKey(LanguageLevel, on_delete=models.CASCADE)
    class Meta:
        verbose_name_plural = "Students"