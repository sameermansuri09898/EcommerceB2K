from rest_framework import serializers
from .models import Product,productimage,colorvarient,sizevarient

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = productimage
        fields = ['id', 'image']
        read_only_fields = ['id']

class ProductColorVarientSerializer(serializers.ModelSerializer):
    class Meta:
        model = colorvarient
        fields = ['id', 'color']
        read_only_fields = ['id']

class ProductSizeVarientSerializer(serializers.ModelSerializer):
    class Meta:
        model = sizevarient
        fields = ['id', 'size']
        read_only_fields = ['id']




class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    colors = ProductColorVarientSerializer(many=True, read_only=True)
    sizes = ProductSizeVarientSerializer(many=True, read_only=True)

    final_price = serializers.SerializerMethodField()
    priceoffer = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock', 'brand', 'description', 'category', 'images', 'colors', 'sizes', 'final_price', 'priceoffer','offer']
        read_only_fields = ['id']

    def validate(self, attrs):

        if not attrs.get('price'):    
            raise serializers.ValidationError("Price is required")
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required")  
        if not attrs.get('brand'):
            raise serializers.ValidationError("Brand is required")
        if not attrs.get('description'):
            raise serializers.ValidationError("Description is required")
        if not attrs.get('category'):
            raise serializers.ValidationError("Category is required")
        if not attrs.get('stock'):
            raise serializers.ValidationError("Stock is required")   
            
        if attrs.get('stock',0) <=0:
            raise serializers.ValidationError("Stock must be greater than 0")
        return attrs

    def get_final_price(self,obj):
        return obj.final_price()
    
    def get_priceoffer(self,obj):
        return obj.offer_price()

 

    def validate_offer(self,offer):
        if offer <0 or offer >100:
            raise serializers.ValidationError("Offer must be between 0 and 100")
        if not offer:    
            raise serializers.ValidationError("Offer is required")
        return offer
    
    def create(self,validated_data):
        product=Product.objects.create(**validated_data)
        return product
    


    