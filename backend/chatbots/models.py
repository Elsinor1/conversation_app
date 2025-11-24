from django.db import models
from utils.model_abstracts import Model
from conversations.models import Theme, Scenario
from users.models import LanguageLevel, User
from django_extensions.db.models import TimeStampedModel

class Chat(
    Model, 
    TimeStampedModel
    ):
    """
    chatbots.Chat   
    Stores information about chat with bot. ID is needed for storing chat data in an SQL database
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="user")
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, verbose_name="theme")
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, verbose_name="scenario")
    language_level = models.ForeignKey(LanguageLevel, on_delete=models.CASCADE, verbose_name="language level")
    is_started = models.BooleanField(default=False)


    class Meta():
        verbose_name = "Chat"
        verbose_name_plural = "Chats"
        ordering = ["id"]

    def __str__(self):
        return f"Chat by {self.user.username} id: {self.id}"

class ChatMessage(
    Model,
    TimeStampedModel
):
    """
    chatbots.ChatMessage
    Stores information about chat message. ID is needed for storing chat message data in an SQL database
    """
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name="chat")
    content = models.TextField(verbose_name="content")
    role = models.CharField(max_length=20, default="assistant")

    class Meta():
        verbose_name = "Chat Message"
        verbose_name_plural = "Chat Messages"
        ordering = ["id"]

    def __str__(self):
        return f"Chat message by {self.chat.user.username} id: {self.id}"