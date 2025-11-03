from django.shortcuts import render
from rest_framework import views, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from .serializers import UserSerializer, LanguageLevelSerializer
from json import JSONDecodeError
from django.http import JsonResponse
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import LanguageLevel, Language, Level
from chatbots.models import Chat


class UserAPIViews(views.APIView):
    """Simple API viewset for User entries """
    serializer_class = UserSerializer
    parser_classes = [JSONParser]

    def get_serializer_context(self):
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }

    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        return self.serializer_class(*args, **kwargs)

    
    def post(self, request):
        try:
            data = JSONParser().parse(request)
            serializer = self.get_serializer(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsAPIView(views.APIView):
    """API view for dashboard statistics"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics for the authenticated user"""
        user = request.user
        
        # Get user's language levels
        language_levels = LanguageLevel.objects.filter(user=user)
        languages = []
        for lang_level in language_levels:
            languages.append({
                'id': lang_level.id,
                'language': {
                    'id': lang_level.language.id,
                    'name': lang_level.language.name
                },
                'level': {
                    'id': lang_level.level.id,
                    'ABC_value': lang_level.level.ABC_value,
                    'name': lang_level.level.name
                },
                'progress': lang_level.progress
            })
        
        # Get chat statistics
        total_chats = Chat.objects.filter(user=user).count()
        completed_chats = Chat.objects.filter(user=user, is_started=True).count()
        
        # Mock vocabulary practices (since we don't have a vocabulary model yet)
        vocabulary_practices = 0
        
        # Mock study time (in minutes) - could be calculated from chat durations
        total_study_time = completed_chats * 15  # Assume 15 minutes per completed chat
        
        stats = {
            'languages': languages,
            'totalChats': total_chats,
            'completedChats': completed_chats,
            'vocabularyPractices': vocabulary_practices,
            'totalStudyTime': total_study_time
        }
        
        return Response(stats, status=status.HTTP_200_OK)


class LanguageLevelsAPIView(views.APIView):
    """API view for language levels"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get language levels for the authenticated user"""
        user = request.user
        language_levels = LanguageLevel.objects.filter(user=user)
        serializer = LanguageLevelSerializer(language_levels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a language level for the authenticated user"""
        user = request.user
        data = JSONParser().parse(request)
        print(f"Received data: {data}")
        data['user'] = user.id  
        print(f"Data with user: {data}")
        serializer = LanguageLevelSerializer(data=data)
        print(f"Serializer is valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        """Update a language level for the authenticated user"""
        user = request.user
        try:
            language_level = LanguageLevel.objects.get(id=pk, user=user)
        except LanguageLevel.DoesNotExist:
            return Response({"error": "Language level not found"}, status=status.HTTP_404_NOT_FOUND)
        
        data = JSONParser().parse(request)
        data['user'] = user.id  
        serializer = LanguageLevelSerializer(language_level, data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LanguagesAPIView(views.APIView):
    """API view for available languages"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all available languages"""
        languages = Language.objects.all()
        data = [{'id': lang.id, 'name': lang.name} for lang in languages]
        return Response(data, status=status.HTTP_200_OK)


class LevelsAPIView(views.APIView):
    """API view for available levels"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all available levels"""
        levels = Level.objects.all()
        data = [{'id': level.id, 'ABC_value': level.ABC_value, 'name': level.name} for level in levels]
        return Response(data, status=status.HTTP_200_OK)