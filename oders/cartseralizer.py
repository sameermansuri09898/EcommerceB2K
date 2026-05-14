from rest_framework import serializers
from .models import Addcart

class AddToCartSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source='product_item.name',
        read_only=True
    )

    varient_color = serializers.CharField(
        source='product_varient.colors.color',  
        read_only=True
    )

    varient_size = serializers.CharField(
        source='product_varient.sizes.size',
        read_only=True
    ) 

    image = serializers.ImageField(
        source='product_varient.images',
        read_only=True
    )

    class Meta:

        model = Addcart

        fields = [
            'id',
            'user',
            'product_item',
            'product_varient',
            'total_price',
            'discounted_price',
            'amount_saved',
            'quantity',
            'created_at',
            'updated_at',
            'is_cart',
            'product_name',
            'varient_color',
            'varient_size',
            'image'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_cart',
            'product_name',
            'varient_color',
            'varient_size',
            'image'
        ]