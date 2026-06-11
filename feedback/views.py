from django.shortcuts import render
from .models import Rating
from .rating_serializer import Ratinserializer
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class RatingCreateUpdateView(generics.CreateAPIView):
    serializer_class = Ratinserializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer =Ratinserializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        product = serializer.validated_data['product']
        variant = serializer.validated_data['variants']
        rating_value = serializer.validated_data['rating']
        review = serializer.validated_data.get('review', '')
        rating, created = Rating.objects.update_or_create(
            user=user,
            product=product,
            variants=variant,
            # beacause lookup ko change nhi krna ex same user same product variant ko again rate kre to only rate and review change ho jaye na ki new entry create ho jaye isliye update_or_create use kr rhe hai
            defaults={'rating': rating_value, 'review': review}
        )

        return Response(Ratinserializer(rating).data, status=status.HTTP_200_OK)
    

class ProductVariantRatingsListView(APIView):
    # Sabhi log ratings dekh sakein (chahe login hon ya nahi)
    permission_classes = [permissions.AllowAny] 
    serializer_class = Ratinserializer

    def get(self, request):
        product_id = request.query_params.get('product_id')
        variant_id = request.query_params.get('variant_id')

        # Validation: Agar product_id nahi bheja toh bad request return karein
        if not product_id:
            return Response(
                {"error": "product_id query parameter is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Base queryset: Sabhi users ki ratings uthao
        rating_queryset = Rating.objects.all()

        # Agar variant_id pass kiya hai toh specific variant filter karo, nahi toh poore product ki saari ratings lao
        if variant_id:
            rating_queryset = rating_queryset.filter(product_id=product_id, variants_id=variant_id)
        else:
            rating_queryset = rating_queryset.filter(product_id=product_id)

        # Latest ratings sabse upar dikhane ke liye ordering (Optional but Professional)
        rating_queryset = rating_queryset.order_by('-created_at') # Agar created_at field model mein hai

        serializer = self.serializer_class(rating_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)