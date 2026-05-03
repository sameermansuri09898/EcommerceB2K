from Account.models import Otp, CustomUser
from rest_framework import serializers
from Account.utils import random_otp, send_otp_email
from django.utils import timezone
from .models import SellerProfile

class OtpSerializer(serializers.Serializer):
    email=serializers.EmailField()
    otp=serializers.IntegerField()

    def validate(self,attrs):
        email=attrs.get('email')
        otp=attrs.get('otp')


        if not email or not otp:
            raise serializers.ValidationError("Email and OTP are required")

        try:
            user=CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")    

        profile=SellerProfile.objects.filter(user=user).first()
        if not profile:
          raise serializers.ValidationError("Seller Account is Not Found")

        obj_otp=Otp.objects.filter(user=user).last() 
        if not obj_otp:
            raise serializers.ValidationError("Otp not found")

        if obj_otp.is_expired():
            raise serializers.ValidationError("Otp expired")    

        if obj_otp.otp != otp:
            raise serializers.ValidationError("Invalid OTP")


        if obj_otp.is_verified:
            raise serializers.ValidationError("Otp already verified")

        if profile.is_verified==True:
            raise serializers.ValidationError("Seller Account is already verified")

        obj_otp.is_verified=True
        obj_otp.save()    
        profile.is_verified=True
        profile.save()    
        return attrs   
 
class OtpResendSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = SellerProfile.objects.get(email=value)
        except SellerProfile.DoesNotExist:
            raise serializers.ValidationError("Seller Account is Not Found")


        # already verified → block resend
        if user.is_verified:
            raise serializers.ValidationError("Seller Account is already verified")

        # check latest OTP
        obj_otp = Otp.objects.filter(user=user).last()

        if not obj_otp:
            raise serializers.ValidationError("OTP not found")

        time_limit = obj_otp.created_at + timezone.timedelta(seconds=60)   
        if time_limit >= timezone.now():
            seconds_remaining = (time_limit - timezone.now()).total_seconds()
            raise serializers.ValidationError(f"Wait for {int(seconds_remaining)} seconds to resend OTP")   

   

        self.user = user
        return value
        

