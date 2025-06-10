from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, RetrieveModelMixin, CreateModelMixin
from .models import Theme, Scenario
from .serializers import ThemeModelSerializer, ScenarioModelSerializer
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from django.http import JsonResponse
from json import JSONDecodeError

class ThemeViewSet(
    ListModelMixin,
    UpdateModelMixin,
    RetrieveModelMixin,
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