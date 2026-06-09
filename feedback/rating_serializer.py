from rest_framework import serializers
from .models import Rating

class Ratinserializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'user', 'product', 'variants', 'rating', 'review', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

        