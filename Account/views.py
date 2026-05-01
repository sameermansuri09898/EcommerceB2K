from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .Accountregserializer import CustomUserSerializer
from rest_framework.generics import ListCreateAPIView
from rest_framework import status
from .models import Otp
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .utils import random_otp, send_otp_email,send_wellcome_email



class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.save()
            otp=random_otp()
            send_otp_email(user.email, str(otp))
            send_wellcome_email(user.email)
            Otp.objects.create(user=user, otp=otp, is_verified=False)
            user.is_verify=False
            user.save()
            return Response({"message":"User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
