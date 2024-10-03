from django.shortcuts import render
from rest_framework import views, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from .serializers import UserSerializer
from json import JSONDecodeError
from django.http import JsonResponse
from rest_framework.exceptions import ValidationError


class UserAPIViews(views.APIView):
    """Simple API viewset for User entries """
    serializer_class = UserSerializer
    parser_classes = [JSONParser]

    def get_serializer_context(self):
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }

    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        return self.serializer_class(*args, **kwargs)

    
    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



