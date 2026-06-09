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

