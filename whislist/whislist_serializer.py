from rest_framework import serializers
from .models import Wishlist

class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'variants']
        read_only_fields = ['id', 'user']



class WhishlistViewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product_item.name',
        read_only=True
    )

    image = serializers.ImageField(
        source='product_varient.images',
        read_only=True
    )

    color = serializers.CharField(
        source='product_varient.colors.color',
        read_only=True
    )

    size = serializers.CharField(
        source='product_varient.sizes.size',
        read_only=True
    )

    price = serializers.DecimalField(
        source='product_varient.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    offer = serializers.DecimalField(
        source='product_varient.offer',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = [
            'id',
            'product_item',
            'product_varient',
            'product_name',
            'image',
            'color',
            'size',
            'price',
            'offer',
        ]   