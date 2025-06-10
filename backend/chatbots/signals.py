from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Chat
from chatbots.chatbots import ConversationBot


@receiver(post_save, sender=Chat)
def chat_post_save_signal(sender, instance, created, **kwargs):
    if created:
       chat_bot = ConversationBot()
    #    When chat is created, introduction is filled
       Chat.objects.filter(id=instance.id).update(introduction=str(chat_bot.chat(instance, human_message=f"Please introduce yourself in {instance.language_level.language}")))
