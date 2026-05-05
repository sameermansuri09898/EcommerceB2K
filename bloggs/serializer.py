from rest_framework import serializers
from .models import Productbloggs

class ProductbloggsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productbloggs
        fields = ['id','name','description','price','image','area','city','state','country','pincode']


    def create(self,validated_data):
        user=self.context['request'].user

        product=Productbloggs.objects.create(user=user,**validated_data)

        return product 