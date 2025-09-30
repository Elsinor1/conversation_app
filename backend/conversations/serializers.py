from rest_framework import serializers
from .models import Theme, Scenario


class ThemeModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Theme
		fields = (
			"id",
			"title",
			"description",
		)


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