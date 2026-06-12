from django.shortcuts import render
from rest_framework import generics,status
from rest_framework.response import Response

from .models import Product,variant,Addcart,Categoriesvarient,colorvarient,sizevarient
from .productserializer import ProductSerializer,catdataSerializer,SizeVariantSerializer,ColorVariantSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
import traceback
from django.db import transaction
from sellerdash.permission import SellerPermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.cache import cache
from.productserializer import VarientProductSerializer
from .cartseralizer import AddToCartRequestSerializer,AddToCartResponseSerializer
from rest_framework.permissions import AllowAny
from rest_framework import serializers
from rest_framework.views import APIView
from django.db.models import Prefetch
from decimal import Decimal

def clear_product_cache(user_id):
    cache.delete(
        f"cache_page:/api/user/productlist/:{user_id}"
    )

class productViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    # ---------------- CREATE ----------------
    permission_classes = [IsAuthenticated,SellerPermission]
    authentication_classes = [JWTAuthentication] 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.save(user=request.user)
        print("id is",product.id)

        return Response(
            {
                "message": "Product created successfully",
                "product_id": product.id
            },
            status=status.HTTP_201_CREATED
        )

    # ---------------- UPDATE ----------------
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.save()

        return Response(
            {
                "message": "Product updated successfully",
                "product_id": product.id
            },
            status=status.HTTP_200_OK
        )

    # ---------------- PARTIAL UPDATE ----------------
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        product = serializer.save()

        return Response(
            {
                "message": "Product partially updated successfully",
                "product_id": product.id
            },
            status=status.HTTP_200_OK
        )

    # ---------------- DELETE ----------------
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_id = instance.id

        instance.delete()

        return Response(
            {
                "message": "Product deleted successfully",
                "product_id": product_id
            },
            status=status.HTTP_200_OK
        )

class ProductVraientViewSet(viewsets.ModelViewSet):
    queryset = variant.objects.all()
    serializer_class = VarientProductSerializer
    permission_classes = [IsAuthenticated,SellerPermission]
    authentication_classes = [JWTAuthentication]
    def create(self, request):
     product_id = request.data.get('product_id')

    # ✅ FIX: FormData sends everything as strings — parse JSON manually
     import json
     raw = request.data.get('variants', '[]')
     variants_data = json.loads(raw) if isinstance(raw, str) else raw

     print(request.data)
     print(variants_data)   # will now show: [{'colors': 83, 'sizes': 61, ...}]

     if not product_id:
        return Response({"message": "Product ID is required"}, status=400)

     try:
        seller_product = Product.objects.get(id=product_id)
     except Product.DoesNotExist:
        return Response({"message": "Product not found"}, status=404)

     data_obj = []
     with transaction.atomic():
         for v in variants_data:
             data_obj.append(
                 variant(
                    seller=request.user,
                    product=seller_product,
                    colors_id=v.get('colors'),
                    sizes_id=v.get('sizes'),
                    images=v.get('images'),
                    price=v.get('price'),
                    offer=v.get('offer'),
                    stock=v.get('stock'),
                )
             )
         variant.objects.bulk_create(data_obj)

    # ✅ Also return variant_id so frontend can PATCH the image
     created_ids = [obj.id for obj in data_obj]
     return Response({
        "message": "Variants created successfully",
        "variant_id": created_ids[0] if created_ids else None,
        "variant_ids": created_ids,
    }, status=201)
    def partial_update(self,request,pk):

      try:
        instance = variant.objects.get(id=pk)
      except variant.DoesNotExist:
        return Response(
            {
                "message": "Variant not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )
      
      if instance.product.user != request.user:
        return Response(
            {
                "message": "You are not authorized to update this variant"
            },
            status=status.HTTP_403_FORBIDDEN
        )
      serializer = VarientProductSerializer(instance,data=request.data,partial=True)
      serializer.is_valid(raise_exception=True)
      
      serializer.save()
      clear_product_cache(request.user.id)
      return Response(
          {
              "message": "Variant updated successfully",
              "variant_id": instance.id
          },
          status=status.HTTP_200_OK
      )
    def destroy(self,request,pk):
      
      try:
        instance = variant.objects.get(id=pk)
      except variant.DoesNotExist:
        return Response(
            {
                "message": "Variant not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )
      
      if instance.product.user != request.user:
        return Response(
            {
                "message": "You are not authorized to delete this variant"
            },
            status=status.HTTP_403_FORBIDDEN
        )
      instance.delete()
      clear_product_cache(request.user.id)
      return Response(
          {
              "message": "Variant deleted successfully",
              "variant_id": instance.id
          },
          status=status.HTTP_200_OK
      )
    
class ProductAndVariantListView(generics.ListAPIView):

    queryset = Product.objects.all()

    serializer_class = ProductSerializer

    permission_classes = [AllowAny]

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all().prefetch_related('variant_set')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
 
class Userproductlistview(generics.ListAPIView):
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication] 

    def get(self,request):
      timeout=60*1
      cache_key=f"cache_page:{request.get_full_path()}:{request.user.id}"
      cached_response=cache.get(cache_key)
      
      if cached_response:
        return Response(cached_response,status=status.HTTP_200_OK)  
      
      data=Product.objects.filter(user=request.user)
      serializer=ProductSerializer(data,many=True)
      cache.set(cache_key,serializer.data,timeout)
      return Response(serializer.data,status=status.HTTP_200_OK)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            # ----------------------------
            # 1. Validate request only
            # ----------------------------
            serializer = AddToCartRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            product_id = serializer.validated_data['product_item']
            variant_id = serializer.validated_data['product_varient']
            quantity = serializer.validated_data['quantity']

            # ----------------------------
            # 2. Get product
            # ----------------------------
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({"message": "Product not found"}, status=404)

            # ----------------------------
            # 3. Get variant
            # ----------------------------
            try:
                product_variant = variant.objects.get(id=variant_id, product=product)
            except variant.DoesNotExist:
                return Response({"message": "Variant not found"}, status=404)

            # ----------------------------
            # 4. Stock checks
            # ----------------------------
            if not product_variant.is_available:
                return Response({"message": "Stock is unavailable"}, status=400)

            if product_variant.stock < quantity:
                return Response({"message": "Insufficient stock"}, status=400)

            # ----------------------------
            # 5. Price calculation (SERVER SIDE ONLY)
            # ----------------------------
            total_price = product_variant.final_price() * quantity
            discounted_price = product_variant.offer_price() * quantity
            amount_saved = (
                (product_variant.price - product_variant.offer_price())
                * quantity
            )

            # ----------------------------
            # 6. Cart update or create
            # ----------------------------
            cart_item, created = Addcart.objects.get_or_create(
                user=request.user,
                product_item=product,
                product_varient=product_variant,
                defaults={
                    "quantity": quantity,
                    "total_price": total_price,
                    "discounted_price": discounted_price,
                    "amount_saved": amount_saved,
                    "is_cart": True
                }
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.total_price += total_price
                cart_item.discounted_price += discounted_price
                cart_item.amount_saved += amount_saved
                cart_item.save()

            # ----------------------------
            # 🔥 CRITICAL FIX: Delete user's cart cache on new add/update
            # ----------------------------
            cache_key = f"cart:{request.user.id}"
            cache.delete(cache_key)

            # ----------------------------
            # 7. Response Generation
            # ----------------------------
            response_serializer = AddToCartResponseSerializer(cart_item)
            
            return Response(
                {
                    "message": "Cart updated successfully",
                    "data": response_serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)

class ViewCart(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        cache_key = f"cart:{request.user.id}"
        cached = cache.get(cache_key)

        # Agar cache mein fresh data hai toh wahin se return karo
        if cached:
            return Response(cached, status=200)

        # Aapka badla hua filter (product_item__isnull=False) jo deleted products ko rokega
        cart_items = Addcart.objects.filter(
            user=request.user, 
            is_cart=True,
            product_item__isnull=False
        ).select_related('product_item') # Speed badhane ke liye select_related zaroor lagayein

        serializer = AddToCartResponseSerializer(cart_items, many=True)

        total_price = sum(
            float(item.total_price)
            for item in cart_items
        )

        data = {
            "cart": serializer.data,
            "total_price": total_price
        }

        # Cache content for 5 minutes
        cache.set(cache_key, data, 120)

        return Response(data, status=200)

class UpdateCart(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def patch(self, request):
        cache_key = f"cart:{request.user.id}"
        cache.delete(cache_key)

        cart_id = request.data.get("cart_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            cart = Addcart.objects.get(id=cart_id, user=request.user)
        except Addcart.DoesNotExist:
            return Response({"message": "Cart not found"}, status=404)

        if quantity <= 0:
            cart.delete()
            return Response({"message": "Deleted"}, status=200)

        if cart.product_varient.stock < quantity:
            return Response({"message": "Insufficient stock"}, status=400)

        price = Decimal(str(cart.product_varient.final_price()))
        offer_price = Decimal(str(cart.product_varient.offer_price()))

        cart.quantity = quantity
        cart.total_price = price * quantity
        cart.discounted_price = offer_price * quantity
        cart.amount_saved = (price - offer_price) * quantity

        cart.save()

        return Response({"message": "Cart updated"}, status=200)  

class DeleteCartItemView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request):
        cache_key = f"cart:{request.user.id}"
        cache.delete(cache_key)

        print("DATA:", request.data)
        print("USER:", request.user)
 
        cart_id = request.data.get("cart_id")

        if not cart_id:
            return Response(
                {"message": "cart_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart_item = Addcart.objects.get(
                id=cart_id,
                user=request.user
            )
        except Addcart.DoesNotExist:
            return Response(
                {"message": "Cart item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()


        return Response(
            {"message": "Cart item deleted successfully"},
            status=status.HTTP_200_OK
        )

class OfferOrders(APIView):

    def get(self, request):

        data = Product.objects.prefetch_related(
            "variant_set"
        ).filter(
            variant_set__offer__gt=50
        ).distinct()

        serial = ProductSerializer(data, many=True)

        return Response(serial.data)
    
class Categoriesdata(APIView):
   permission_classes =[AllowAny]
   def get(self,request):
      data=Categoriesvarient.objects.all().order_by('id')
      serializer=catdataSerializer(data,many=True)
      return Response(serializer.data)
   
class VariantSizeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        data = sizevarient.objects.all().order_by("id")
        serializer = SizeVariantSerializer(data, many=True)
        return Response(serializer.data)

class VariantColorView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        data = colorvarient.objects.all().order_by("id")
        serializer = ColorVariantSerializer(data, many=True)
        return Response(serializer.data)


