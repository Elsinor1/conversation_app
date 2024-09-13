from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, RetrieveModelMixin
from .models import Theme, Scenario
from .serializers import ThemeModelSerializer, ScenarioModelSerializer


class ThemeViewSet(
    ListModelMixin,
    UpdateModelMixin,
    RetrieveModelMixin,
    viewsets.GenericViewSet
    ):
    """Simple ViewSet for listing and retrieving Themes"""
    queryset = Theme.objects.all()
    serializer_class = ThemeModelSerializer


class ScenarioViewSet(
    ListModelMixin,
    UpdateModelMixin,
    RetrieveModelMixin,
    viewsets.GenericViewSet
    ):
    """Simple ViewSet for listing and retrieving Scenarios"""
    queryset = Scenario.objects.all()
    serializer_class = ScenarioModelSerializer