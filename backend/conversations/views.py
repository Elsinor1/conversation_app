from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, RetrieveModelMixin, CreateModelMixin
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Theme, Scenario
from .serializers import ThemeModelSerializer, ScenarioModelSerializer, ThemeWithScenariosSerializer
from rest_framework.parsers import JSONParser
from django.http import JsonResponse
from json import JSONDecodeError
from users.models import LanguageLevel
from users.serializers import LanguageLevelSerializer

class ThemeViewSet(
    ListModelMixin,
    UpdateModelMixin,
    RetrieveModelMixin,
    CreateModelMixin,
    viewsets.GenericViewSet
    ):
    """Simple ViewSet for listing and retrieving Themes"""
    queryset = Theme.objects.all()
    serializer_class = ThemeModelSerializer

    def create(self, request):
        try:
            data = JSONParser().parse(request)
            serializer = ThemeModelSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except JSONDecodeError:
            return JsonResponse({"result": "error","message": "Json decoding error"}, status= 400)


class ScenarioViewSet(
    ListModelMixin,
    UpdateModelMixin,
    RetrieveModelMixin,
    CreateModelMixin,
    viewsets.GenericViewSet
    ):
    """Simple ViewSet for listing and retrieving Scenarios"""
    queryset = Scenario.objects.all()
    serializer_class = ScenarioModelSerializer

    def create(self, request):
        try:
            data = JSONParser().parse(request)
            serializer = ScenarioModelSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                
                serializer.save()
                print("test")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except JSONDecodeError:
            return JsonResponse({"result": "error","message": "Json decoding error"}, status= 400)


class PracticeSetupAPIView(APIView):
    """API endpoint that returns themes with their associated scenarios nested and user's language levels"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get all themes with their scenarios using prefetch_related for efficiency
            themes = Theme.objects.prefetch_related('scenario_set').all()
            themes_serializer = ThemeWithScenariosSerializer(themes, many=True)
            
            # Get user's language levels
            user = request.user
            language_levels = LanguageLevel.objects.filter(user=user)
            language_levels_serializer = LanguageLevelSerializer(language_levels, many=True)
            
            # Combine both datasets
            response_data = {
                'themes': themes_serializer.data,
                'language_levels': language_levels_serializer.data
            }
            
            print('Practice setup data:', response_data)
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch practice setup data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )