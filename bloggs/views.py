from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from sellerdash.permission import SellerPermission
from .models import Productbloggs
from .serializer import ProductbloggsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from sellerdash.permission import SellerPermission
class Blogview(APIView):
  permission_classes=[IsAuthenticated,SellerPermission]
  authentication_classes = [JWTAuthentication]

  def post(self,request):
    data=request.data
    serializer=ProductbloggsSerializer(data=data,context={'request':request})
    if serializer.is_valid():
      serializer.save()
      return Response({'message':'Product created successfully'},status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

  def delete(self,request,pk):
    try:
      data=Productbloggs.objects.get(pk=pk)
      if data.user!=request.user:
        return Response({'message':'You are not authorized to delete this product'},status=status.HTTP_403_FORBIDDEN)  
      data.delete()
      return Response({'message':'Product deleted successfully'},status=status.HTTP_200_OK)  
    except Productbloggs.DoesNotExist:
      return Response({'message':'Product not found'},status=status.HTTP_404_NOT_FOUND)   


class Retreaveproductbloggs(generics.RetrieveAPIView):
  queryset = Productbloggs.objects.all()
  serializer_class = ProductbloggsSerializer

