from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import status

from .coupon_utils import offer_coupon
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Coupons
from decimal import Decimal
from django.utils import timezone



class CouponCreateView(APIView):

  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def post(self,request):
    copn=offer_coupon()
    print(copn)
    coupon = Coupons.objects.create(
    coupon=copn,
    Discount=request.data.get("Discount"),
    min_oder_value=request.data.get("min_oder_value"),
    valid_from=timezone.now(),
    valid_to=request.data.get("valid_to"),
    used_coupon=0
)
    return Response({
      "mssg":"Coupon Is Created Success",
      "status":status.HTTP_201_CREATED
    })



class ApplyCoupon(APIView):
  permission_classes=[IsAuthenticated]
  authentication_classes=[JWTAuthentication]

  def post(self,request):
      coupon_code=request.data.get("coupon")
      total_cart=request.data.get("cart")
      if not coupon_code or not total_cart:
            return Response(
                {"message": "Coupon and cart amount required"},
                status=status.HTTP_400_BAD_REQUEST
            )
      try:
       coupon_data = Coupons.objects.get(coupon=coupon_code)
      except Coupons.DoesNotExist:
       return Response({
        "mssg":"Coupons is Not Found",
        "Status":status.HTTP_400_BAD_REQUEST
      })

      valid_coupon,message = coupon_data.valid_coupon(
         request.user,
         Decimal(total_cart)
      )
      if not valid_coupon:
         return Response(
                {"message": message},
                status=status.HTTP_400_BAD_REQUEST
            )
      
      discount_amount = (
            Decimal(total_cart) * coupon_data.Discount
        ) / Decimal("100")
      
      final_amount=Decimal(total_cart) - discount_amount

      return Response({
            "message": message,
            "discount": discount_amount,
            "final_amount": final_amount
        })

       

