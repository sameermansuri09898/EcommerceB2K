from rest_framework import serializers
from .models import *
from .models import Categoriesvarient
class VarientProductSerializer(serializers.ModelSerializer):
    color_name  = serializers.CharField(source='colors.color', read_only=True)
    size_name   = serializers.CharField(source='sizes.size',   read_only=True)
    image_url   = serializers.ImageField(source='images',      read_only=True)
    final_price = serializers.SerializerMethodField()
    offer_price = serializers.SerializerMethodField()

    class Meta:
        model  = variant
        fields = [
            'id', 'color_name', 'size_name', 'price', 'offer',
            'stock', 'product', 'image_url', 'final_price', 'offer_price',
            'colors', 'sizes', 'images',   # ✅ images writable rakha
        ]
        read_only_fields = [
            'id', 'color_name', 'size_name',
            'image_url', 'final_price', 'offer_price',
        ]
        extra_kwargs = {
            'colors':  {'write_only': True},
            'sizes':   {'write_only': True},
            'product': {'read_only': True},  # view mein set hoga
        }

    def validate_stock(self, value):
        if value < 0:   raise serializers.ValidationError("Stock cannot be negative")
        if value > 100: raise serializers.ValidationError("Stock cannot exceed 100")
        return value

    def validate_price(self, value):
        if value < 0: raise serializers.ValidationError("Price cannot be negative")
        return value

    def validate_offer(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Offer must be between 0 and 100")
        return value

    def get_final_price(self, obj): return obj.final_price()
    def get_offer_price(self, obj): return obj.offer_price()

class ProductSerializer(serializers.ModelSerializer):
    categorie_name=serializers.CharField(source='category.categorie',read_only=True)
    variant_set=VarientProductSerializer(many=True,read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'name', 'brand', 'description', 'categorie_name','product_image','variant_set','category']
        
        extra_kwargs = {
            'category': {'write_only': True},
        
        }


    def validate_name(self,value):
        if len(value)<5:
            raise serializers.ValidationError("Name cannot be less than 5 characters")
        return value   

    def validate_brand(self,value):
        if len(value)<3:
            raise serializers.ValidationError("Brand cannot be less than 3 characters")
        return value

    def validate_description(self,value):
        if len(value)<10:
            raise serializers.ValidationError("Description cannot be less than 10 characters")
        return value

    def validate_category(self, value):
    # value ek Category instance hai
     if not value:
        raise serializers.ValidationError("Category is required.")
     return value
        
    def create(self, validated_data):
        product=Product.objects.create(**validated_data)
        return product
        
class catdataSerializer(serializers.ModelSerializer):
    class Meta:
        model=Categoriesvarient
        fields='__all__'

class SizeVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = sizevarient
        fields = "__all__"

class ColorVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = colorvarient
        fields = "__all__"        


    