from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import User, LanguageLevel, Language, Level

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

class LanguageLevelTestCase(APITestCase):
    """
    Test block for LanguageLevel
    """

    def setUp(self):
        self.client = APIClient()
        
        # Create a test user and authenticate
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create Language and Level objects for testing
        self.language = Language.objects.create(name="English")
        self.level = Level.objects.create(ABC_value="A1", name="Beginner")
        
        self.data = {
            "language": self.language.id,
            "level": self.level.id,
            "progress": 0
        }
        self.url = "/language_level/"

    def test_create_language_level(self):
        """
        Test LanguageLevel View post method
        """
        data = self.data
        response = self.client.post(self.url, data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LanguageLevel.objects.count(), 1)
        language_level = LanguageLevel.objects.get()
        self.assertEqual(language_level.language, self.language)
        self.assertEqual(language_level.level, self.level)
        self.assertEqual(language_level.progress, 0)

    def test_create_language_level_without_level(self):
        """
        Test LanguageLevel View post method when level is not in data
        """
        data = self.data.copy()
        data.pop("level")
        response = self.client.post(self.url, data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(LanguageLevel.objects.count(), 0)

    def test_create_language_level_without_language(self):
        """
        Test LanguageLevel View post method when language is not in data
        """
        data = self.data.copy()
        data.pop("language")
        response = self.client.post(self.url, data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(LanguageLevel.objects.count(), 0)

    def test_create_language_level_without_progress(self):
        """
        Test LanguageLevel View post method when progress is not in data
        """
        data = self.data.copy()
        data.pop("progress")
        response = self.client.post(self.url, data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LanguageLevel.objects.count(), 1)
        language_level = LanguageLevel.objects.get()
        self.assertEqual(language_level.progress, 0)  # Default value

    def test_get_language_levels(self):
        """
        Test LanguageLevel View get method
        """
        # Create a language level first
        LanguageLevel.objects.create(
            user=self.user,
            language=self.language,
            level=self.level,
            progress=25
        )
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['progress'], 25)

    def test_get_language_levels_empty(self):
        """
        Test LanguageLevel View get method when user has no language levels
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_update_language_level(self):
        """
        Test LanguageLevel View put method
        """
        # First create a language level
        language_level = LanguageLevel.objects.create(
            user=self.user,
            language=self.language,
            level=self.level,
            progress=0
        )
        
        # Update it
        update_data = {
            "language": self.language.id,
            "level": self.level.id,
            "progress": 50
        }
        response = self.client.put(f"{self.url}{language_level.id}/", update_data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify the update
        language_level.refresh_from_db()
        self.assertEqual(language_level.progress, 50)

    def test_update_language_level_with_different_language(self):
        """
        Test LanguageLevel View put method with different language
        """
        # Create another language
        spanish = Language.objects.create(name="Spanish")
        
        # First create a language level
        language_level = LanguageLevel.objects.create(
            user=self.user,
            language=self.language,
            level=self.level,
            progress=0
        )
        
        # Update it with different language
        update_data = {
            "language": spanish.id,
            "level": self.level.id,
            "progress": 75
        }
        response = self.client.put(f"{self.url}{language_level.id}/", update_data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify the update
        language_level.refresh_from_db()
        self.assertEqual(language_level.language, spanish)
        self.assertEqual(language_level.progress, 75)

    def test_update_language_level_invalid_data(self):
        """
        Test LanguageLevel View put method with invalid data
        """
        # First create a language level
        language_level = LanguageLevel.objects.create(
            user=self.user,
            language=self.language,
            level=self.level,
            progress=0
        )
        
        # Try to update with invalid data (missing language)
        update_data = {
            "level": self.level.id,
            "progress": 50
        }
        response = self.client.put(f"{self.url}{language_level.id}/", update_data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_nonexistent_language_level(self):
        """
        Test LanguageLevel View put method with nonexistent ID
        """
        update_data = {
            "language": self.language.id,
            "level": self.level.id,
            "progress": 50
        }
        response = self.client.put(f"{self.url}999/", update_data, format='vnd.api+json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)