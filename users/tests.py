from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import User   

class UserTestCase(APITestCase):
    """
    Test block for User
    """

    def setUp(self):
        self.client = APIClient()
        self.data = {
            "username" : "Billy Smith",
            "email" : "billy.smith@test.com"
        }
        self.url = "/user/"

    def test_create_user(self):
        """
        Test User View create method
        """
        data = self.data
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "Billy Smith")


    def test_create_user_without_username(self):
        """
        Test User View create method when username is not in data
        """
        data = self.data.pop("username")
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_create_user_when_username_equals_blank(self):
        """
        Test User View create method when username is blank string
        """
        data = self.data
        data["username"] = ""
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_create_user_without_email(self):
        """
        Test User View create method when email is not in data
        """
        data = self.data.pop("email")
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_create_user_when_email_equals_blank(self):
        """
        Test User View create method when email is blank string
        """
        data = self.data
        data["email"] = ""
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_create_user_with_incorrect_email(self):
        """
        Test User View create method when email not correct
        """
        data = self.data
        data["email"] = "billy.smithtest.com"
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)