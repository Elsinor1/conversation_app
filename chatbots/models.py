from django.db import models
from users.models import User
from conversations.models import Theme, Scenario

class Chat(models.Model):
    """
    Chat model. ID is needed for storing chat data in an SQL database
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="users")
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, verbose_name="themes")
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, verbose_name="scenarios")


    def __str__(self):
        return f"Chat by {self.user.username}"
