from .models import Otp, CustomUser
from rest_framework import serializers
from .utils import random_otp, send_otp_email

class OtpSerializer(serializers.ModelSerializer):
    email=serializers.EmailField()
    otp=serializers.IntegerField()
    class Meta:
        model = Otp
        fields = ['email', 'otp'] 

    def validate(self,attrs):
        otp=attrs.get('otp')
        email=attrs.get('email')

        user=CustomUser.objects.get(email=email)

        if user is None:
            raise serializers.ValidationError("user is not found")

        user_obj=Otp.objects.filter(user=user,otp=otp,is_verified=False).first()
        if user_obj is None:
            raise serializers.ValidationError("otp is not Found")
        if user_obj.otp_is_expiry():
            user_obj.delete()
            raise serializers.ValidationError("otp is expired")

        user_obj.is_verified=True
        user_obj.save()
        user.is_verified=True
        user.save()
        return attrs

class OtpResendSerializer(serializers.ModelSerializer):
    email=serializers.EmailField()
    otp=serializers.CharField()
    class Meta:
        model = Otp
        fields = ['email','otp']
    def validate(self,attrs):
        otp=attrs.get('otp')
        email=attrs.get('email')

        user=CustomUser.objects.get(email=email)
        if user is None:
            raise serializers.ValidationError("user is not found")

        if Otp.objects.filter(user=user,is_verified=True).first():
            raise serializers.ValidationError("otp is already verified")
        
        otp=random_otp()
        send_otp_email(user.email, str(otp))
        Otp.objects.create(user=user, otp=otp, is_verified=False)
        user.is_verified=False
        user.save()
        return attrs


class Loginserializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()

    class Meta:
        model = CustomUser
        fields = ['email', 'password'] 
     