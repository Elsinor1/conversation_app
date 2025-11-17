from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from utils.model_abstracts import Model
from users.models import Language, Level, User
from conversations.models import Theme
from django_extensions.db.models import TimeStampedModel

class VocabularyWord(Model, TimeStampedModel):
    """
    vocabulary.VocabularyWord
    Stores a vocabulary word.
    parameters:     word: str
                    language: model:users.Language
                    level: model:users.Level
                    user: model:User (many-to-many)
                    translation: str
    """
    word = models.CharField(max_length=255)
    german_translation = models.CharField(max_length=255)
    czech_translation = models.CharField(max_length=255)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, verbose_name="levels")
    creator = models.ManyToManyField(User, blank=True, verbose_name="users") # Optional - information who created the word
    theme = models.ManyToManyField(Theme, blank=True, verbose_name="themes")
    
    def save(self, *args, **kwargs):
            self.word = self.word.capitalize()
            self.german_translation = self.german_translation.capitalize()
            self.czech_translation = self.czech_translation.capitalize()
            return super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Vocabulary words"

    def __str__(self):
        return f"{self.word} - {self.level} - {self.german_translation}"

class UserVocabularyWord(Model, TimeStampedModel):
    """
    vocabulary.UserVocabularyWord
    Stores the learning status of a vocabulary word for a specific user.
    parameters:     user: model:users.User
                    vocabulary_word: model:vocabulary.VocabularyWord
                    learning_status: str (choices: not_learned, in_progress, learned)
    """
      
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="user")
    vocabulary_word = models.ForeignKey(VocabularyWord, on_delete=models.CASCADE, verbose_name="vocabulary_word")
    learning_status = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="learning_status"
    )
    is_selected_for_practice = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = "User vocabulary words"
        unique_together = ['user', 'vocabulary_word']  # Prevent duplicate entries
    
    def __str__(self):
        return f"{self.user.username} - {self.vocabulary_word.word} ({self.learning_status}%)"

class VocabularyList(Model):
    """
    vocabulary.VocabularyList
    Stores a vocabulary list.
    parameters:     name: str
                    user: model:User (many-to-many)
    """
    name = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE, verbose_name="languages")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="users")
    user_vocabulary_word = models.ManyToManyField(UserVocabularyWord, blank=True, verbose_name="user_vocabulary_words")
    
    class Meta:
        verbose_name_plural = "Vocabulary lists"

    def __str__(self):
        return f"{self.name} - {self.user}"




class VocabularyPractice(Model, TimeStampedModel):
    """
    vocabulary.VocabularyPractice
    Stores a vocabulary practice.
    parameters:     user_vocabulary_words: model:vocabulary.UserVocabularyWord (many-to-many)
                    user: model:User 
                    time_length: int
    """
    user_vocabulary_words = models.ManyToManyField(UserVocabularyWord, blank=True, null=True, verbose_name="user_vocabulary_words")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="user")
    time_length = models.IntegerField(default=0, verbose_name="time_length")
    
    class Meta:
        verbose_name_plural = "Vocabulary practices"

    def __str__(self):
        return f"Practice {self.id} - {self.user_vocabulary_words.count()} words"