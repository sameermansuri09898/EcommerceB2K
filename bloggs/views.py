from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Productbloggs
from .serializer import ProductbloggsSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from sellerdash.services.rate_limit import rate_limit
from sellerdash.permission import SellerPermission

from django.core.cache import cache


class Bloggview(APIView):
  permission_classes=[IsAuthenticated,SellerPermission]
  authentication_classes=[JWTAuthentication]

  
  def post(self,request):
    serializer=ProductbloggsSerializer(data=request.data,context={'request':request})
    if serializer.is_valid():
      serializer.save()
      return Response({"message":"Product post created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

  @rate_limit(5,60)

  def get(self,request):
    bloggs=Productbloggs.objects.filter(user=request.user)
    serializer=ProductbloggsSerializer(bloggs,many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)  

  def put(self,request,id):
    bloggs=Productbloggs.objects.get(id=id,user=request.user)
    serializer=ProductbloggsSerializer(bloggs,data=request.data,partial=True)
    if serializer.is_valid():
      serializer.save()
      return Response({"message":"Product post updated successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

  def delete(self,request,id):
    bloggs=Productbloggs.objects.get(id=id,user=request.user)
    bloggs.delete()
    return Response({"message":"Product post deleted successfully"}, status=status.HTTP_200_OK)  
