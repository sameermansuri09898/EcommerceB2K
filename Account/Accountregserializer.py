
from rest_framework import serializers
from .models import CustomUser
import re

class CustomUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'confirm_password','mobile_number', 'is_verified', 'role', 'bio', 'profile_image']

        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def validate_username(self, value):
            if CustomUser.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
            return value
        
    def validate_mobile_number(self, value):
        if CustomUser.objects.filter(mobile_number=value).exists():
            raise serializers.ValidationError("Mobile number already exists")
        return value

    def validate_role(self, value):
        if value not in ['customer', 'seller']:
            raise serializers.ValidationError("Invalid role")
        return value

    def validate_profile_image(self, value):
        if value and not value.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            raise serializers.ValidationError("Invalid file type. Only PNG, JPG, JPEG, GIF images are allowed.")
            
        max_size = 5 * 1024 * 1024  
        if value and value.size > max_size:
            raise serializers.ValidationError(f"Image size must be less than 5MB. Current size: {value.size / (1024 * 1024):.2f}MB")
            
        return value

    def validate_bio(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("Bio must be less than 500 characters")
        return value

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Username must contain only alphanumeric characters and underscores")

        if  CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")   

        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long")
        return value

    def validate_mobile_number(self, value):
        if len(value) != 10:
            raise serializers.ValidationError("Mobile number must be 10 digits long")
        return value

    def validate_email(self, value):
        if not value.endswith('@gmail.com'):
            raise serializers.ValidationError("Email must be a Gmail address")
        return value    


    def create(self, validated_data):
        """
        Create a new user with the given validated data.
        """
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class Loginserializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()

    class Meta:
        model = CustomUser
        fields = ['email', 'password'] 
     