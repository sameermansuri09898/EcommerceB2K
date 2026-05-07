from django.shortcuts import render
from rest_framework import generics,status
from rest_framework.response import Response
from .models import Product,variant
from .productserializer import ProductSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django.db import transaction
from sellerdash.permission import SellerPermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.cache import cache
from.productserializer import VarientProductSerializer
from rest_framework.permissions import AllowAny
from rest_framework import serializers
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

        variants_data = request.data.get('variants', [])

        print(request.data)
        print(variants_data)

        if not product_id:

            return Response(
                {"message": "Product ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            seller_product = Product.objects.get(id=product_id)

        except Product.DoesNotExist:

            return Response(
                {"message": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        data_obj = []

        with transaction.atomic():

            for v in variants_data:

                data_obj.append(

                variant(

                    product=seller_product,

                    colors_id=v.get('colors'),

                    sizes_id=v.get('sizes'),

                    images=v.get('images'),

                    price=v.get('price'),

                    offer=v.get('offer'),

                    stock=v.get('stock')

                )
            )

        print(data_obj)

        variant.objects.bulk_create(data_obj)

        return Response(
            {
                  "message": "Variants created successfully"
            },
            status=status.HTTP_201_CREATED
        )
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
      return Response(
          {
              "message": "Variant deleted successfully",
              "variant_id": instance.id
          },
          status=status.HTTP_200_OK
      )
    
class ProductAndVariantListView(generics.ListAPIView):

    queryset = Product.objects.all().prefetch_related('variant_set')

    serializer_class = ProductSerializer

    permission_classes = [AllowAny]




class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
 
class Userproductlistview(generics.ListAPIView):
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication] 

    
    def get(self,request):
      timeout=60*15
      cache_key=f"cache_page:{request.get_full_path()}:{request.user.id}"
      cached_response=cache.get(cache_key)
      
      if cached_response:
        return Response(cached_response,status=status.HTTP_200_OK)  
      
      data=Product.objects.filter(user=request.user)
      serializer=self.get_serializer(data,many=True)
      cache.set(cache_key,serializer.data,timeout)
      return Response(serializer.data,status=status.HTTP_200_OK)
