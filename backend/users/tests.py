from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth.models import User   

class UserTestCase(APITestCase):
    """
    Test block for User
    """

    def setUp(self):
        self.client = APIClient()
        self.data = {
            "username" : "Test_Username",
            "email" : "test.email@test.com",
            "password" : "test_password"
        }
        self.url = "/register/"

    def test_create_user(self):
        """
        Test User View post method
        """
        data = self.data
        response = self.client.post(self.url, data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "Test_Username")


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


    def test_create_user_without_password(self):
        """
        Test User View create method when password is not in data
        """
        data = self.data.pop("password")
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_create_user_when_password_equals_blank(self):
        """
        Test User View create method when password is blank string
        """
        data = self.data
        data["password"] = ""
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_create_user_with_incorrect_email(self):
        """
        Test User View create method when email not correct
        """
        data = self.data
        data["email"] = "test.test.com"
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)