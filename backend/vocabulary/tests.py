from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
import json
from .models import VocabularyWord, UserVocabularyWord
from users.models import User, Level, Language


class UserVocabularyWordViewSetTestCase(APITestCase):
    """
    Test block for UserVocabularyWordViewSet
    Includes tests for single creation, list, retrieve, update, and delete
    """

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='testuser@test.com'
        )
        
        # Create another user to test user isolation
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpassword123',
            email='otheruser@test.com'
        )
        
        # Create language and level for vocabulary words
        self.language = Language.objects.create(name="Test Language")
        self.level = Level.objects.create(ABC_value="A", name="Beginner")
        
        # Create test vocabulary words
        self.vocab_word_1 = VocabularyWord.objects.create(
            word="Hello",
            german_translation="Hallo",
            czech_translation="Ahoj",
            level=self.level
        )
        self.vocab_word_2 = VocabularyWord.objects.create(
            word="World",
            german_translation="Welt",
            czech_translation="Svět",
            level=self.level
        )
        self.vocab_word_3 = VocabularyWord.objects.create(
            word="Test",
            german_translation="Test",
            czech_translation="Test",
            level=self.level
        )
        
        # Token authentication
        self.token = Token.objects.get(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.url = "/user-vocabulary-words/"

    def test_list_user_vocabulary_words_empty(self):
        """
        Test listing user vocabulary words when none exist
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_user_vocabulary_words(self):
        """
        Test listing user vocabulary words
        """
        # Create some user vocabulary words
        UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1,
            learning_status=50,
            is_selected_for_practice=True
        )
        UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_2,
            learning_status=75
        )
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_only_returns_current_user_words(self):
        """
        Test that list only returns vocabulary words for the authenticated user
        """
        # Create words for both users
        UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1
        )
        UserVocabularyWord.objects.create(
            user=self.other_user,
            vocabulary_word=self.vocab_word_2
        )
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['vocabulary_word'], self.vocab_word_1.id)

    def test_create_single_user_vocabulary_word(self):
        """
        Test creating a single user vocabulary word
        """
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id),
            "learning_status": 25,
            "is_selected_for_practice": True
        }
        response = self.client.post(self.url, json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserVocabularyWord.objects.count(), 1)
        
        user_vocab_word = UserVocabularyWord.objects.get()
        self.assertEqual(user_vocab_word.user, self.user)
        self.assertEqual(user_vocab_word.vocabulary_word, self.vocab_word_1)
        self.assertEqual(user_vocab_word.learning_status, 25)
        self.assertEqual(user_vocab_word.is_selected_for_practice, True)

    def test_create_single_user_vocabulary_word_with_defaults(self):
        """
        Test creating a single user vocabulary word with default values
        """
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id)
        }
        response = self.client.post(self.url, json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user_vocab_word = UserVocabularyWord.objects.get()
        self.assertEqual(user_vocab_word.learning_status, 0)
        self.assertEqual(user_vocab_word.is_selected_for_practice, False)

    def test_create_single_user_vocabulary_word_duplicate(self):
        """
        Test that creating a duplicate user vocabulary word fails
        """
        # Create first instance
        UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1
        )
        
        # Try to create duplicate
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id)
        }
        response = self.client.post(self.url, json.dumps(data), content_type='application/json')
        
        # Should fail due to unique_together constraint
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_vocabulary_word(self):
        """
        Test retrieving a single user vocabulary word
        """
        user_vocab_word = UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1,
            learning_status=40,
            is_selected_for_practice=True
        )
        
        response = self.client.get(f"{self.url}{user_vocab_word.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data['id']), str(user_vocab_word.id))
        self.assertEqual(response.data['vocabulary_word'], self.vocab_word_1.id)
        self.assertEqual(response.data['learning_status'], 40)
        self.assertEqual(response.data['is_selected_for_practice'], True)

    def test_retrieve_other_user_vocabulary_word(self):
        """
        Test that user cannot retrieve other user's vocabulary words
        """
        other_user_vocab_word = UserVocabularyWord.objects.create(
            user=self.other_user,
            vocabulary_word=self.vocab_word_1
        )
        
        response = self.client.get(f"{self.url}{other_user_vocab_word.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_user_vocabulary_word(self):
        """
        Test updating a user vocabulary word
        """
        user_vocab_word = UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1,
            learning_status=30,
            is_selected_for_practice=False
        )
        
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id),
            "learning_status": 80,
            "is_selected_for_practice": True
        }
        response = self.client.put(f"{self.url}{user_vocab_word.id}/", json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user_vocab_word.refresh_from_db()
        self.assertEqual(user_vocab_word.learning_status, 80)
        self.assertEqual(user_vocab_word.is_selected_for_practice, True)

    def test_partial_update_user_vocabulary_word(self):
        """
        Test partial update (PATCH) of a user vocabulary word
        """
        user_vocab_word = UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1,
            learning_status=30,
            is_selected_for_practice=False
        )
        
        data = {
            "learning_status": 90
        }
        response = self.client.patch(f"{self.url}{user_vocab_word.id}/", json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user_vocab_word.refresh_from_db()
        self.assertEqual(user_vocab_word.learning_status, 90)
        self.assertEqual(user_vocab_word.is_selected_for_practice, False)  # Unchanged

    def test_delete_user_vocabulary_word(self):
        """
        Test deleting a user vocabulary word
        """
        user_vocab_word = UserVocabularyWord.objects.create(
            user=self.user,
            vocabulary_word=self.vocab_word_1
        )
        
        response = self.client.delete(f"{self.url}{user_vocab_word.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserVocabularyWord.objects.count(), 0)

    def test_delete_other_user_vocabulary_word(self):
        """
        Test that user cannot delete other user's vocabulary words
        """
        other_user_vocab_word = UserVocabularyWord.objects.create(
            user=self.other_user,
            vocabulary_word=self.vocab_word_1
        )
        
        response = self.client.delete(f"{self.url}{other_user_vocab_word.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(UserVocabularyWord.objects.count(), 1)

    def test_create_without_authentication(self):
        """
        Test that unauthenticated requests are rejected
        """
        self.client.credentials()  # Remove authentication
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id)
        }
        response = self.client.post(self.url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_with_invalid_learning_status(self):
        """
        Test creating with invalid learning_status (out of range)
        """
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id),
            "learning_status": 150  # Out of range (0-100)
        }
        response = self.client.post(self.url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_with_negative_learning_status(self):
        """
        Test creating with negative learning_status
        """
        data = {
            "user": str(self.user.id),
            "vocabulary_word": str(self.vocab_word_1.id),
            "learning_status": -10  # Negative value
        }
        response = self.client.post(self.url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
