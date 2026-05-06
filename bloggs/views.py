from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from sellerdash.permission import SellerPermission
from .models import Productbloggs
from .serializer import ProductbloggsSerializer

class BlogView(generics.ListCreateAPIView):

    queryset = Productbloggs.objects.all()
    serializer_class = ProductbloggsSerializer
    authentication_classes = [JWTAuthentication]


    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), SellerPermission()]
        return [IsAuthenticated()]

    def get_queryset(self):
      
        return Productbloggs.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)