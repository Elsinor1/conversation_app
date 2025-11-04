from django.shortcuts import render
from .models import VocabularyWord, VocabularyPractice, VocabularyList, UserVocabularyWord
from .serializers import VocabularyWordModelSerializer, VocabularyPracticeModelSerializer, VocabularyListModelSerializer, UserVocabularyWordModelSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from django.http import JsonResponse
from json import JSONDecodeError
from rest_framework import status
from rest_framework.response import Response

class UserVocabularyWordViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin,):
    """
    Simple ViewSet for listing, creating, updating and deleting user vocabulary words
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserVocabularyWordModelSerializer
    parser_classes = [JSONParser]  # Use regular JSON instead of JSON:API
    renderer_classes = [JSONRenderer]  # Return regular JSON instead of JSON:API
    
    def get_queryset(self):
        """
        This view should return a list of all the UserVocabularyWords
        for the currently authenticated user.
        """
        user = self.request.user
        return UserVocabularyWord.objects.filter(user=user).prefetch_related('vocabulary_word', 'vocabulary_word__level')
    
    def perform_create(self, serializer):
        """
        Set the user to the current authenticated user when creating a new UserVocabularyWord.
        """
        serializer.save(user=self.request.user)

class GeneralVocabularyWordViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting general vocabulary words
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VocabularyWordModelSerializer    
    queryset = VocabularyWord.objects.all().prefetch_related('level', 'theme')

class VocabularyListViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting vocabulary lists
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VocabularyListModelSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all the VocabularyLists
        for the currently authenticated user.
        """
        user = self.request.user
        return VocabularyList.objects.filter(user=user).prefetch_related('language', 'user_vocabulary_words')

class UserVocabularyWordStatusViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin):
    """
    ViewSet for managing user vocabulary word learning status
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserVocabularyWordModelSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all the UserVocabularyWords
        for the currently authenticated user.
        """
        user = self.request.user
        return UserVocabularyWord.objects.filter(user=user).prefetch_related('vocabulary_word', 'vocabulary_word__level')
    
    def perform_create(self, serializer):
        """
        Set the user to the current authenticated user when creating a new UserVocabularyWord.
        """
        serializer.save(user=self.request.user)

class VocabularyPracticeViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting vocabulary practices
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VocabularyPracticeModelSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all the VocabularyPractices
        for the currently authenticated user.
        """
        user = self.request.user
        return VocabularyPractice.objects.filter(user=user).prefetch_related('words', 'words__level')