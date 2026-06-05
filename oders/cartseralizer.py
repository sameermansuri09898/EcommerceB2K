from rest_framework import serializers
from .models import Addcart

class AddToCartRequestSerializer(serializers.Serializer):
    product_item = serializers.IntegerField()
    product_varient = serializers.IntegerField()
    quantity = serializers.IntegerField(required=False, default=1)


# fir out id se uski detail nkaalne ke liye 

class AddToCartResponseSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(source='product_item.name', read_only=True)
    varient_color = serializers.CharField(source='product_varient.colors.color', read_only=True)
    varient_size = serializers.CharField(source='product_varient.sizes.size', read_only=True)
    image = serializers.ImageField(source='product_varient.images', read_only=True)

    class Meta:
        model = Addcart
        fields = [
            'id',
            'product_item',
            'product_varient',
            'quantity',
            'total_price',
            'discounted_price',
            'amount_saved',
            'product_name',
            'varient_color',
            'varient_size',
            'image',
            'created_at',
        ]