from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from conversations.models import Theme, Scenario
from users.models import LanguageLevel, Language, Level
from django.contrib.auth.models import User
from .models import Chat
from rest_framework.authtoken.models import Token
from rest_framework import status


class ChatAPITestCase(APITestCase):
    """
    Simple test case for ChatAPI usage
    """
    def setUp(self):        
        # Setup of test DB data 
        theme = Theme.objects.create(title="Test Theme")
        scenario = Scenario.objects.create(
            title="Test Scenario",
            theme = theme,
            student_role = "Test Student Role",
            teacher_role = "Test Teacher Role"
            )
        language = Language.objects.create(name="Test Language")
        level = Level.objects.create(ABC_value="A", name="Test Level")
        
        # Two users. Allows chat objects to be linked to different users
        self.user_1 = User.objects.create_user(
            username='testuser1', 
            password='this_is_a_test',
            email='testuser1@test.com'
        )
        self.user_2 = User.objects.create_user(
            username='testuser2', 
            password='this_is_a_test',
            email='testuser2@test.com'
        )
        # Language levels for both users
        language_level_1 = LanguageLevel.objects.create(level=level, language=language, user=self.user_1)
        language_level_2 = LanguageLevel.objects.create(level=level, language=language, user=self.user_2)
        self.data = {
            "theme":str(theme.id),
            "scenario":str(scenario.id),
            "language_level":str(language_level_1.id)
        }


        # Creating 3 test Chat object linked to user 1
        for i in range(0, 3):
            Chat.objects.create(
                user=self.user_1, 
                theme=theme, 
                scenario=scenario, 
                language_level=language_level_1
            )
        self.chats = Chat.objects.filter(user=self.user_1)

        # Creating test Chat linked to user 2
        Chat.objects.create(
                user=self.user_2, 
                theme=theme, 
                scenario=scenario, 
                language_level=language_level_2
            )

        # Token authentificatioin
        self.token = Token.objects.get(user=self.user_1)
        self.client = APIClient()

        # Passing the token to all API calls
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)


    def test_get_all_chats(self):
        """
        Test API list method
        """
        # Check all chats amount
        self.assertEqual(Chat.objects.count(), 4)
        response = self.client.get("/chat/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Chat amount from response should be equal to chats created by user 1
        self.assertEqual(len(response.data), 3)

    def test_get_one_chat(self):
        """
        Test Retrieve single chat
        """
        for chat in self.chats:
            response = self.client.get(f"/chat/{chat.id}/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_chat(self):
        """
        Test Post method for Chat endpoint
        """
        response = self.client.post("/chat/", data=self.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Chat.objects.count(), 5)
        self.assertEqual(str(response.data["theme"]), self.data["theme"])
        self.assertEqual(str(response.data["scenario"]), self.data["scenario"])
        self.assertEqual(str(response.data["language_level"]), self.data["language_level"])

    def test_create_chat_without_theme_id(self):
        """
        Test Post method for Chat endpoint when theme is missing in data
        """
        data = self.data.pop("theme")
        response = self.client.post("/chat/", data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_chat_without_scenario_id(self):
        """
        Test Post method for Chat endpoint when scenario is missing in data
        """
        data = self.data.pop("scenario")
        response = self.client.post("/chat/", data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)  

    def test_create_chat_without_language_level_id(self):
        """
        Test Post method for Chat endpoint when language_level is missing in data
        """
        data = self.data.pop("language_level")
        response = self.client.post("/chat/", data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 

    def test_create_chat_with_incorrect_auth_token(self):
        """
        Test Post method for Chat endpoint when language_level is missing in data
        """
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + "testoken11")
        response = client.post("/chat/", data=self.data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_chat(self):
        """
        Test delete method for Chat endpoint
        """
        chat = Chat.objects.filter(user = self.user_1).first()
        response = self.client.delete(f"/chat/{chat.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Chat.objects.filter(id=chat.id))


class ChatMessagesAPIViewTestCase(APITestCase):
    
    def setUp(self):
         # Setup of test DB data 
        self.theme = Theme.objects.create(title="Test Theme")
        self.scenario = Scenario.objects.create(
            title="Test Scenario",
            theme = self.theme,
            student_role = "Test Student Role",
            teacher_role = "Test Teacher Role"
            )
        language = Language.objects.create(name="Test Language")
        level = Level.objects.create(ABC_value="A", name="Test Level")
        self.user = User.objects.create_user(
            username='testuser1', 
            password='this_is_a_test',
            email='testuser1@test.com'
        )
        self.language_level = LanguageLevel.objects.create(level=level, language=language, user=self.user)
        self.data = {
            "theme":str(self.theme.id),
            "scenario":str(self.scenario.id),
            "language_level":str(self.language_level.id)
        }
        self.chat = Chat.objects.create(
                user=self.user, 
                theme=self.theme, 
                scenario=self.scenario, 
                language_level=self.language_level
            )
        self.url = "/chat_message/"

        # Token authentificatioin
        self.token = Token.objects.get(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key) # Passing the token to all API calls

    def test_successful_chat_messages_creation(self):
        """
        Test a successful chatbot message creation
        """
        data = {
            "chat_id": self.chat.id,
        }

        self.assertFalse(self.chat.is_started) # Chat is not started yet
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0) # Data length is > 0
        self.chat.refresh_from_db() # Reloads the chat from the test DB
        self.assertTrue(self.chat.is_started) # Chat is started

    def test_missing_chat_id(self):
        """
        Test chatbot message creation with missing chat_id
        """
        data = {
            "message": "Hello"
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_message(self):
        """
        Test chatbot message with missing message when chat has been already started
        """
        # Creating started chat
        chat = Chat.objects.create(
                user=self.user, 
                theme=self.theme, 
                scenario=self.scenario, 
                language_level=self.language_level,
                is_started = True
            )
        data = {
            "chat_id": chat.id
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_json_decoding_error(self):
        """
        Test chatbot message creation with invalid JSON input
        """
        invalid_json_data = "This is not valid JSON"
        response = self.client.post(self.url, invalid_json_data, content_type='application/vnd.api+json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("JSON parse error", response.content.decode())

    def test_unauthorized_access(self):
        """
        Test chatbot message creation with missing or invalid token
        """
        # Test without token
        client = APIClient()  # New client without token
        data = {
            "chat_id": self.chat.id,
            "message": "Hello"
        }
        response = client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)