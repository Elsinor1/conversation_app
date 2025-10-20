from django.db import models
from utils.model_abstracts import Model
from users.models import Language, Level, User

class VocabularyWord(Model):
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
    translation = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE, verbose_name="languages")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, verbose_name="levels")
    user = models.ManyToManyField(User, verbose_name="users")

    class Meta:
        verbose_name_plural = "Vocabulary words"

    def __str__(self):
        return f"{self.word} - {self.language} - {self.level} - {self.user}"
    
class VocabularyPractice(Model):
    """
    vocabulary.VocabularyPractice
    Stores a vocabulary practice.
    parameters:     words: model:vocabulary.VocabularyWord (many-to-many)
                    user: model:User (many-to-many) 
    """
    words = models.ManyToManyField(VocabularyWord, verbose_name="vocabulary_words")
    user = models.ManyToManyField(User, verbose_name="users")

    class Meta:
        verbose_name_plural = "Vocabulary practices"

    def __str__(self):
        return f"Practice {self.id} - {self.words.count()} words - {self.user.count()} users"