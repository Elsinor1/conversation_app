from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import User, LanguageLevel
from vocabulary.models import VocabularyList

@receiver(post_save, sender=User)
def create_auth_token_for_new_user(sender, instance=None, created=False, **kwargs):
	if created:
		Token.objects.create(user=instance) 

@receiver(post_save, sender=LanguageLevel)
def create_vocabulary_list_for_new_language_level(sender, instance=None, created=False, **kwargs):
	if created:
		VocabularyList.objects.create(user=instance.user, language=instance.language, name=f"{instance.language.name} {instance.level.name} Vocabulary List")