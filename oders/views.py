from django.shortcuts import render
from rest_framework import generics,status
from rest_framework.response import Response
from .models import Product
from .productserializer import ProductSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import Product,productimage,colorvarient,sizevarient
from django.db import transaction
from sellerdash.services.cachepage import cache_page_decorators
from sellerdash.permission import SellerPermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator

class productViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    permission_classes = [IsAuthenticated,SellerPermission]
    authentication_classes = [JWTAuthentication]

   
    def list(self,request):
      data=self.get_queryset()
      serializer=self.get_serializer(data,many=True)
      return Response(serializer.data)
      
    def create(self,request,*args,**kwargs):
      image=request.FILES.getlist('images')
      colors=request.data.getlist('colors')
      sizes=request.data.getlist('sizes')

      serializer=self.get_serializer(data=request.data)
      if serializer.is_valid():
        with transaction.atomic():
         product=serializer.save(user=request.user)
         if image:

          for img in image:
            productimage.objects.create(product=product,image=img)

         if colors:
          for color in colors:
            colorvarient.objects.create(product=product,color=color)    

         if sizes:
          for size in sizes:
            sizevarient.objects.create(product=product,size=size)

        return Response({'message':'Product created successfully'},status=status.HTTP_201_CREATED)
      return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)    

    def update(self,request,*args,**kwargs):
      instance_obj=self.get_object()
      images=request.FILES.getlist('images')
      colors=request.data.getlist('colors')
      sizes=request.data.getlist('sizes')
      
      serializer=self.get_serializer(instance_obj,data=request.data)
      if serializer.is_valid():
        with transaction.atomic():
          product=serializer.save(user=request.user)

          if images:
            productimage.objects.filter(product=product).delete()
            for img in images:
              productimage.objects.create(product=product,image=img)

          if colors:
            colorvarient.objects.filter(product=product).delete()
            for color in colors:
              colorvarient.objects.create(product=product,color=color)    

          if sizes:
            sizevarient.objects.filter(product=product).delete()
            for size in sizes:
              sizevarient.objects.create(product=product,size=size)
        return Response({'message':'Product updated successfully'},status=status.HTTP_200_OK)
      return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)    

    def partial_update(self,request,*args,**kwargs):
      instance_obj=self.get_object() 
      images=request.FILES.getlist('images')
      colors=request.data.getlist('colors')
      sizes=request.data.getlist('sizes')
      
      serializer=self.get_serializer(instance_obj,data=request.data,partial=True) 
      if serializer.is_valid():
        with transaction.atomic():
          product=serializer.save(user=request.user)  

          if images:
            productimage.objects.filter(product=product).delete()
            for img in images:
              productimage.objects.create(product=product,image=img)

          if colors:
            colorvarient.objects.filter(product=product).delete()
            for color in colors:
              colorvarient.objects.create(product=product,color=color)    

          if sizes:
            sizevarient.objects.filter(product=product).delete()
            for size in sizes:
              sizevarient.objects.create(product=product,size=size)
        return Response({'message':'Product updated successfully'},status=status.HTTP_200_OK)
      return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def destroy(self,request,*args,**kwargs):
      instance_obj=self.get_object()
      with transaction.atomic():
        productimage.objects.filter(product=instance_obj).delete()
        colorvarient.objects.filter(product=instance_obj).delete()
        sizevarient.objects.filter(product=instance_obj).delete()
        instance_obj.delete()
      return Response({'message':'Product deleted successfully'},status=status.HTTP_200_OK)  




    