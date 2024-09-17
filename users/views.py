from django.shortcuts import render
from rest_framework import views, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from .serializers import UserSerializer
from json import JSONDecodeError
from django.http import JsonResponse


class UserAPIViews(views.APIView):
    """Simple API viewset for User entries """
    serializer_class = UserSerializer

    def get_serializer_contaxt(self):
        return{
            'request': self.request,
            'format':self.format_kwarg,
            'view':self
        }
    
    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_contaxt()
        return self.serializer_class(*args, **kwargs)
    
    def post(self, request):
        try:
            # Parses data from the request into JSON
            data = JSONParser().parse(request)
            serializer = UserSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except JSONDecodeError:
            return JsonResponse({"result": "error", "message":"Json decoding error"}, status=400)



