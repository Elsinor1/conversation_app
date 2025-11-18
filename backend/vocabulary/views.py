from django.shortcuts import render
from .models import VocabularyWord, VocabularyPractice, VocabularyList, UserVocabularyWord
from .serializers import VocabularyWordModelSerializer, VocabularyPracticeModelSerializer, VocabularyListModelSerializer, UserVocabularyWordModelSerializer, VocabularyListUpdateModelSerializer, UserVocabularyWordUpdateModelSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from django.http import JsonResponse
from json import JSONDecodeError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

class UserVocabularyWordViewSet(GenericViewSet, ListModelMixin, CreateModelMixin, DestroyModelMixin, RetrieveModelMixin, UpdateModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting user vocabulary words
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserVocabularyWordModelSerializer
    parser_classes = [JSONParser]  # Use regular JSON instead of JSON:API
    renderer_classes = [JSONRenderer]  # Return regular JSON instead of JSON:API
    
    def get_queryset(self):
        """
        This view should return a list of all the UserVocabularyWords
        for the currently authenticated user.
        """
        user = self.request.user
        return UserVocabularyWord.objects.filter(user=user).prefetch_related('vocabulary_word', 'vocabulary_word__level')

    def create(self, request, *args, **kwargs):
        """
        Create a new UserVocabularyWord.
        Supports both single and bulk creation
        If the request data is a list of vocabulary word ids, create a new UserVocabularyWord for each vocabulary word id
        If the request data is a single vocabulary word id, create a new UserVocabularyWord for the vocabulary word id
        """
        # Check if the request data is a list of vocabulary word ids
        if isinstance(request.data.get("vocabulary_word_ids"), list):
            for vocabulary_word_id in request.data.get("vocabulary_word_ids"):
                data = request.data.copy()
                data["vocabulary_word"] = vocabulary_word_id
                data["user"] = self.request.user.id
                serializer = UserVocabularyWordModelSerializer(data=data)
                created_user_words = []
                try:
                    if serializer.is_valid(raise_exception=True):
                        serializer.save()
                        created_user_words.append(serializer.data)
                except ValidationError:
                    print(f"Validation error: {serializer.errors}, request data: {request.data}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            print(f"Created user word(s): {created_user_words}")
            return Response(created_user_words, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Validation error, array expected"}, status=status.HTTP_400_BAD_REQUEST)
 

class UserVocabularyWordBulkUpdateView(APIView):
    """
    API view for updating multiple UserVocabularyWords.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]  # Use regular JSON instead of JSON:API
    renderer_classes = [JSONRenderer]  # Return regular JSON instead of JSON:API

    def put(self, request, *args, **kwargs):
        """
        Update multiple UserVocabularyWords.
        expected request data: [{"id": uuid, "learning_status": 0-100}, ...]
        """
        user = request.user
        updated_user_vocabulary_words = []
        
        for update_data in request.data:
            word_id = update_data.get("id")
            learning_status = update_data.get("learning_status", 0)
            
            if not word_id or not learning_status:
                continue
            
            # Validate learning_status is between 0 and 100
            learning_status = max(0, min(100, int(learning_status)))
            
            try:
                user_vocabulary_word = UserVocabularyWord.objects.get(id=word_id, user=user)
                user_vocabulary_word.learning_status = learning_status
                user_vocabulary_word.save(update_fields=["learning_status"])
                updated_user_vocabulary_words.append(UserVocabularyWordModelSerializer(user_vocabulary_word).data)
            except UserVocabularyWord.DoesNotExist:
                print(f"UserVocabularyWord {word_id} not found for user {user.id}")
            except Exception as e:
                print(f"Error updating word {word_id}: {e}")
        
        return Response(updated_user_vocabulary_words, status=status.HTTP_200_OK)

class GeneralVocabularyWordViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting general vocabulary words
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VocabularyWordModelSerializer    
    queryset = VocabularyWord.objects.all().prefetch_related('level', 'theme')


class VocabularyListAPIView(APIView):
    """
    API view for listing, creating, updating and deleting vocabulary word lists
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]  # Use regular JSON instead of JSON:API
    renderer_classes = [JSONRenderer]  # Return regular JSON instead of JSON:API

    def get(self, request):
        """
        Return a list of all the VocabularyLists for the currently authenticated user.
        """
        try:
            user = request.user
            vocabulary_lists = VocabularyList.objects.filter(user=user).prefetch_related('language', 'user_vocabulary_word')
            serializer = VocabularyListModelSerializer(vocabulary_lists, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        """
        Update a VocabularyList.
        Supports updating user_vocabulary_words by providing a list of IDs.
        expected request data: {
            "id": uuid,
            "vocabulary_word": [uuid1, uuid2, ...],
            "user_vocabulary_word": [uuid1, uuid2, ...]
        }
        """
        user = request.user
        vocabulary_list = VocabularyList.objects.get(id=request.data["id"], user=user)
        serializer = VocabularyListUpdateModelSerializer(vocabulary_list, data=request.data)
        # print(f"Serializer: {serializer}")
        if serializer.is_valid(raise_exception=True):
            # Use validated_data instead of data - this is safe to access before save()
            # print(f"Serializer validated data: {str(serializer.validated_data)}")
            vocabulary_words = serializer.validated_data.get("vocabulary_word", [])
            user_vocabulary_words = serializer.validated_data.get("user_vocabulary_word", [])

            print(f"Vocabulary words: {vocabulary_words}")
            print(f"User vocabulary words: {user_vocabulary_words}")

            # Create UserVocabularyWord objects for vocabulary words if provided
            for vocabulary_word in vocabulary_words:
                user_vocab_word, _ = UserVocabularyWord.objects.get_or_create(
                    user=user,
                    vocabulary_word=vocabulary_word,
                    defaults={'learning_status': 0, 'is_selected_for_practice': False}
                )
                if user_vocab_word not in user_vocabulary_words:
                    user_vocabulary_words.append(user_vocab_word)
                    print(f"User vocabulary word added: {user_vocab_word}")
            
            # Update validated_data with the final user_vocabulary_words list
            # This ensures the serializer saves the correct ManyToMany relationship
            serializer.validated_data["user_vocabulary_word"] = user_vocabulary_words
            print(f"User vocabulary words: {user_vocabulary_words} for vocabulary list: {vocabulary_list}")            
            # Save the instance - serializer will handle the ManyToMany field
            serializer.save()
            
            # Now it's safe to access serializer.data after save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UserVocabularyWordStatusViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin):
#     """
#     ViewSet for managing user vocabulary word learning status
#     """
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#     serializer_class = UserVocabularyWordModelSerializer
    
#     def get_queryset(self):
#         """
#         This view should return a list of all the UserVocabularyWords
#         for the currently authenticated user.
#         """
#         user = self.request.user
#         return UserVocabularyWord.objects.filter(user=user).prefetch_related('vocabulary_word', 'vocabulary_word__level')
    
    def perform_create(self, serializer):
        """
        Set the user to the current authenticated user when creating a new UserVocabularyWord.
        """
        serializer.save(user=self.request.user)

class VocabularyPracticeSessionViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin):
    """
    Simple ViewSet for listing, creating, updating and deleting vocabulary practices
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VocabularyPracticeModelSerializer
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]
    
    def get_queryset(self):
        """
        This view should return a list of all the VocabularyPractices
        for the currently authenticated user.
        """
        user = self.request.user
        return VocabularyPractice.objects.filter(user=user).prefetch_related('user_vocabulary_words')
    
    def perform_create(self, serializer):
        """
        Set the user to the current authenticated user when creating a new VocabularyPractice.
        """
        serializer.save(user=self.request.user)
        print(f"Vocabulary practice session created: {serializer.data}")

    
    