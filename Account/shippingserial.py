from rest_framework import serializers
from .models import BuyerShipping

class BuyerShippingSerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerShipping
        fields = [
            'id',
            'full_name',
            'mobile_number',
            'address_line',
            'landmark',
            'opposite_of',
            'city',
            'state',
            'zip_code',
            'address_type',
            'is_default',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'created_at'
        ]

    def create(self, validated_data):
        return BuyerShipping.objects.create(
            user=self.context['request'].user,
            **validated_data
        )