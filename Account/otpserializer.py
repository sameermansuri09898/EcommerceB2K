from .models import Otp
from rest_framework import serializers

class OtpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Otp
        fields = ['user', 'otp', 'is_verified']