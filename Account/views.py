from rest_framework.response import Response
from rest_framework.views import APIView
from .Accountregserializer import CustomUserSerializer,Loginserializer
from rest_framework.generics import ListCreateAPIView
from rest_framework import status
from .models import Otp,BuyerShipping
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .utils import random_otp, send_otp_email,send_wellcome_email
from .otpserializer import OtpSerializer,OtpResendSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .shippingserial import BuyerShippingSerializer

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
            user.is_verified=False
            user.save()
            return Response({"message":"User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OtpSerializer(data=request.data)
        if serializer.is_valid():
            
            return Response({ "Otp verified successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = OtpResendSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.user
            otp=random_otp()
            send_otp_email(user.email, str(otp))
            obj=Otp.objects.filter(user=user)
            obj.delete()
            Otp.objects.create(user=user, otp=otp, is_verified=False)
            user.is_verified=False
            user.save()
            return Response({"message":"Otp sent successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def post(self,request):
        serializer = Loginserializer(data=request.data)
        if serializer.is_valid():
            username=serializer.validated_data['username']
            password=serializer.validated_data['password']
            user=authenticate(username=username,password=password)

            if user is None:
                return Response({"message":"Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            if user.is_verified==False:
                return Response({"message":"User is not verified"}, status=status.HTTP_401_UNAUTHORIZED)

        

            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({"message":"User logged in successfully","role":user.role, "access_token": str(refresh.access_token),"refresh_token": str(refresh)}, status=status.HTTP_201_CREATED)

            return Response({"message":"Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class Logout(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            refresh_token=request.data["refresh_token"]
            token=RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message":"User logged out successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message":str(e)}, status=status.HTTP_401_UNAUTHORIZED)


"""
shipping address  
"""
class ShippingAddresview(APIView):
  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def post(self,request):
    serializer=BuyerShippingSerializer(data=request.data,context={'request':request})
    if serializer.is_valid():
      serializer.save()
      return Response({"message":"Shipping address created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  


class getshippingAddress(APIView):

  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def get(self,request):
    shipping=BuyerShipping.objects.filter(user=request.user)
    serializer=BuyerShippingSerializer(shipping,many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)  


class setshippingAddress(APIView):

  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def post(self,request,id):
    user=request.user
    shipping=BuyerShipping.objects.filter(id=id,user=user)
    
    if shipping is None:
      return Response({"message":"Shipping address not found"}, status=status.HTTP_404_NOT_FOUND)
    shipping.is_default=True
    shipping.save()
    return Response({"message":"Shipping address set successfully"}, status=status.HTTP_200_OK)

class updateshippingAddress(APIView):

  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def put(self,request,id):
    user=request.user
    shipping=BuyerShipping.objects.get(id=id,user=user)
    
    if shipping is None:
      return Response({"message":"Shipping address not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer=BuyerShippingSerializer(shipping,data=request.data,partial=True)
    if serializer.is_valid():
      serializer.save()
      return Response({"message":"Shipping address updated successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class deleteShippingAddress(APIView):

  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def delete(self,request,id):
    user=request.user
    shipping=BuyerShipping.objects.filter(id=id,user=user)
    
    if shipping is None:
      return Response({"message":"Shipping address not found"}, status=status.HTTP_404_NOT_FOUND)
    
    shipping.delete()
    return Response({"message":"Shipping address deleted successfully"}, status=status.HTTP_200_OK)    
