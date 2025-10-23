from rest_framework import serializers
from .models import VocabularyWord, VocabularyPractice, VocabularyList, UserVocabularyWord

class VocabularyWordModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyWord
        fields = (
            "id",
            "word",
            "german_translation",
            "czech_translation",
            "level",
            "user",
            "theme"
        )   

class VocabularyListModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyList
        fields = (
            "id",
            "name",
            "language",
            "user",
            "vocabulary_words"
        )

class VocabularyPracticeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyPractice
        fields = (
            "id",
            "words",
            "user"
        )

class UserVocabularyWordModelSerializer(serializers.ModelSerializer):
    vocabulary_word = VocabularyWordModelSerializer(read_only=True)
    vocabulary_word_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserVocabularyWord
        fields = (
            "id",
            "user",
            "vocabulary_word",
            "vocabulary_word_id",
            "learning_status",
            "created",
            "modified"
        )
        read_only_fields = ("user", "created", "modified")
