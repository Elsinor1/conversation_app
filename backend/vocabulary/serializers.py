from rest_framework import serializers
from .models import VocabularyWord, VocabularyPractice, VocabularyList, UserVocabularyWord
from users.serializers import LevelSerializer
from conversations.serializers import ThemeModelSerializerIdTitleOnly
from users.serializers import LanguageSerializer

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
    user_vocabulary_word = serializers.PrimaryKeyRelatedField(queryset=UserVocabularyWord.objects.all(), many=True)
    language = LanguageSerializer(read_only=True)

    class Meta:
        model = VocabularyList
        fields = (
            "id",
            "name",
            "language",
            "user",
            "user_vocabulary_word"
        )

class VocabularyListUpdateModelSerializer(serializers.ModelSerializer):
    vocabulary_word = serializers.PrimaryKeyRelatedField(queryset=VocabularyWord.objects.all(), many=True, required=False)
    user_vocabulary_word = serializers.PrimaryKeyRelatedField(queryset=UserVocabularyWord.objects.all(), many=True, required=False)

    class Meta:
        model = VocabularyList
        fields = (
            "id",
            "vocabulary_word",
            "user_vocabulary_word"
        )

class VocabularyPracticeModelSerializer(serializers.ModelSerializer):
    user_vocabulary_words = serializers.PrimaryKeyRelatedField(queryset=UserVocabularyWord.objects.all(), many=True, required=False)
    
    class Meta:
        model = VocabularyPractice
        fields = (
            "id",
            "user_vocabulary_words",
            "user",
            "time_length"
        )
        extra_kwargs = {
            'user': {'required': False},  # Will be set by perform_create
            'time_length': {'required': False}
        }

class UserVocabularyWordModelSerializer(serializers.ModelSerializer):
    # For input: accepts UUID as primary key
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
    
    def to_representation(self, instance):
        """Override to use VocabularyWordModelSerializer for vocabulary_word when exporting"""
        representation = super().to_representation(instance)
        # Serialize vocabulary_word using VocabularyWordModelSerializer
        vocabulary_word_serializer = VocabularyWordModelSerializer(instance.vocabulary_word)
        representation['vocabulary_word'] = vocabulary_word_serializer.data
        return representation

class UserVocabularyWordUpdateModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserVocabularyWord
        fields = (
            "id",
            "user",
            "learning_status"
        )