from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import Scenario, Theme


class ScenarioTestCase(APITestCase):
    """
    Test block for Scenario ViewSet
    """

    def setUp(self):
        self.client = APIClient()
        self.theme_id = Theme.objects.create(title="Test Theme", description="Test Description").id
        self.data = {
            "title" : "Test title",
            "description" : "Test description",
            "theme" : self.theme_id
        }
        self.url = "/scenario/"


    def test_create_scenario(self):
        """
        Test Scenario ViewSet create method
        """
        data = self.data
        response = self.client.post(self.url, data, HTTP_CONTENT_TYPE='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Scenario.objects.count(), 1)
        self.assertEqual(Scenario.objects.get().title, "Test title")

    
    def test_create_scenario_without_title(self):
        """
        Test Scenario ViewSet create method when title is not in data
        """
        data = self.data.pop("title")
        response = self.client.post(self.url, data, HTTP_CONTENT_TYPE='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    
    def test_create_scenario_when_title_equals_blank(self):
        """
        Test Scenario ViewSet create method when title is blank
        """
        data = self.data
        data["title"] = ""
        response = self.client.post(self.url, data, HTTP_CONTENT_TYPE='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)



class ThemeTestCase(APITestCase):
    """
    Simple Test Case for Theme model
    """

    def setUp(self):
        self.client = APIClient()
        self.data = {
            "title" : "Test title",
            "description" : " Test Description"
        }
        self.url = "/theme/"
    
    def test_create_theme(self):
        """
        Test of Theme ViewSet create method 
        """
        data = self.data
        request = self.client.post(self.url, data, HTTP_CONTENT_TYPE='application/json')
        self.assertEqual(request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Theme.objects.count(), 1)
        self.assertEqual(Theme.objects.get().title, "Test title")

    
    def test_create_theme_without_title(self):
        """
        Test of Theme ViewSet create method when title is not in data 
        """
        data = self.data.pop("title")
        request = self.client.post(self.url, data)
        self.assertEqual(request.status_code, status.HTTP_400_BAD_REQUEST)

    
    def test_create_theme_when_title_equals_blank(self):
        """
        Test of Theme ViewSet create method when title is blank 
        """
        data = self.data
        data["title"] = ""
        request = self.client.post(self.url, data)
        self.assertEqual(request.status_code, status.HTTP_400_BAD_REQUEST)