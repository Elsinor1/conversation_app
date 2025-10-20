from rest_framework import serializers
from .models import Theme, Scenario


class ScenarioModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Scenario
		fields = (
			"id",
			"title",
			"slug",
			"description",
			"theme",
			"teacher_role",
			"student_role",
		)


class ThemeModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Theme
		fields = (
			"id",
			"title",
			"description",
		)


class ScenarioNestedSerializer(serializers.ModelSerializer):
	"""Serializer for scenarios nested within themes"""
	class Meta:
		model = Scenario
		fields = (
			"id",
			"title",
			"description",
			"teacher_role",
			"student_role",
		)


class ThemeWithScenariosSerializer(serializers.ModelSerializer):
	"""Serializer for themes with nested scenarios"""
	scenarios = ScenarioNestedSerializer(source='scenario_set', many=True, read_only=True)
	
	class Meta:
		model = Theme
		fields = (
			"id",
			"title",
			"description",
			"scenarios",
		) 