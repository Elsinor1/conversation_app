from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import Scenario, Theme


class ScenarioTestCase(APITestCase):
    """
    Test block for Scenario
    """

    def setUp(self):
        self.client = APIClient()
        self.data = {
            "name" : "Test name",
            "description" : "Test description"
        }
        self.url = "/scenario/"


    def test_create_scenario(self):
        """
        Test Scenario ViewSet create method
        """
        data = self.data
        response = self.client.post(self.url, data)
        self.assertAlmostEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(Scenario.objects.count(), 1)
        self.assertAlmostEqual(Scenario.objects.get().name, "Test name")

    
    def test_create_scenario_without_name(self):
        """
        Test Scenario ViewSet create method when name is not in data
        """
        data = self.data.pop("name")
        response = self.client.post(self.url, data)
        self.assertAlmostEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    
    def test_create_scenario_when_name_equals_blank(self):
        """
        Test Scenario ViewSet create method when name is blank
        """
        data = self.data
        data["name"] = ""
        response = self.client.post(self.url, data)
        self.assertAlmostEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

