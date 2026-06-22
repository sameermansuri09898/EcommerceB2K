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
from oders.models import Product,variant
from oders.productserializer import ProductSerializer  


class selleaccount(APIView):
 
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
 
    def post(self, request):
        serializer = sellerserializer(data=request.data)
        if serializer.is_valid():
            seller = serializer.save()
 
            seller.user = request.user
            seller.is_verified = False
            seller.save()
 
            # Send OTP for email verification
            otp = random_otp()
            Otp.objects.create(user=seller, otp=otp, is_verified=False)
            send_otp_email(seller.email, str(otp))
            send_wellcome_email(seller.email)
 
            return Response(
                {"message": "Seller account created successfully. Please verify your email."},
                status=status.HTTP_201_CREATED
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Itpverification(APIView):
  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]
  def post(self,request):
    serializer=OtpSerializer(data=request.data)
    if serializer.is_valid():
      return Response({"message":"Otp verified successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
    
class resendotp(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[JWTAuthentication]
    def post(self,request):
      serializer=OtpResendSerializer(data=request.data)
      if serializer.is_valid():
        seller=serializer.user
        otp=random_otp()
        send_otp_email(seller.email, str(otp))
        Otp.objects.create(user=seller, otp=otp, is_verified=False)
        seller.is_verified=False
        seller.save()
        return Response({"message":"Otp sent successfully"}, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

# --------------------------get seller products---------------


class GetSellerProduct(APIView):
  permission_classes=[IsAuthenticated,]
  authentication_classes=[JWTAuthentication]
  def get(self,request):
    product=Product.objects.filter(user=request.user).prefetch_related("variants_set")
    serializer=ProductSerializer(product,many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



