from utils.model_abstracts import Model
from django.db import models
from django_extensions.db.models import TimeStampedModel, TitleDescriptionModel, TitleSlugDescriptionModel


class Theme(Model, TitleDescriptionModel, TimeStampedModel):
    """
    conversations.Theme
    Stores a theme for a conversation 
    """
    title = models.CharField(max_length=255, unique=True, verbose_name="titles")

    class Meta():
        verbose_name_plural = "Themes"

    def __str__(self):
        return f"Theme: {self.title}"
    
class Scenario(Model,  TimeStampedModel, TitleSlugDescriptionModel):

    title = models.CharField(max_length=255, unique=True, verbose_name="titles")
    theme = models.ForeignKey(to=Theme ,on_delete=models.CASCADE, verbose_name="themes")
    teacher_role = models.CharField(max_length=255, verbose_name="teacher_roles")
    student_role = models.CharField(max_length=255, verbose_name="student_roles")

    class Meta():
        verbose_name_plural = "Scenarios"

    def __str__(self):
        return f"Scenario: {self.title} from {self.theme}"