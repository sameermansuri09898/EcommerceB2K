from .models import BuyerShipping
from rest_framework import serializers

class BuyerShippingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerShipping
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self,validated_data):
        user=self.context['request'].user

        buyer=BuyerShipping.objects.create(user=user,**validated_data)

        return buyer

        
