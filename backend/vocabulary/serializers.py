from rest_framework import serializers
from .models import VocabularyWord, VocabularyPractice, VocabularyList, UserVocabularyWord
from users.serializers import LevelSerializer
from conversations.serializers import ThemeModelSerializerIdTitleOnly

class VocabularyWordModelSerializer(serializers.ModelSerializer):
    level = LevelSerializer(read_only=True)
    theme = ThemeModelSerializerIdTitleOnly(many=True, read_only=True)

    class Meta:
        model = VocabularyWord
        fields = (
            "id",
            "word",
            "german_translation",
            "czech_translation",
            "level",
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
            "user_vocabulary_word"
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
    vocabulary_word = serializers.PrimaryKeyRelatedField(queryset=VocabularyWord.objects.all(), required=True)
    
    class Meta:
        model = UserVocabularyWord
        fields = (
            "id",
            "user",
            "vocabulary_word",
            "learning_status",
            "is_selected_for_practice"
        )
        extra_kwargs = {
            'learning_status': {'required': False},
            'is_selected_for_practice': {'required': False},
            'user': {'required': False}  # Will be set by perform_create
        }
