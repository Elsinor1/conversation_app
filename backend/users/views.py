from django.shortcuts import render
from rest_framework import views, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from .serializers import UserSerializer
from json import JSONDecodeError
from django.http import JsonResponse
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import LanguageLevel
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
        language_levels = LanguageLevel.objects.filter(user=user).select_related('language', 'level')
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
                }
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

