from rest_framework.decorators import permission_classes
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from Account.models import CustomUser
from Account.utils import random_otp,send_otp_email
from .models import SellerProfile
from .verificationotp import OtpSerializer,OtpResendSerializer  
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .serializer import sellerserializer
from Account.models import Otp
from .Successselleremail import send_wellcome_email

class selleaccount(APIView):

  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def post(self,request):
    serializer=sellerserializer(data=request.data)
    if serializer.is_valid():
      seller=serializer.save()

      otp=random_otp()
      send_otp_email(seller.email, str(otp))
      Otp.objects.create(user=seller, otp=otp, is_verified=False)
      seller.is_verified=False
      seller.user=seller
      seller.save()
      send_wellcome_email(seller.email)
      return Response({"message":"Seller created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  

  