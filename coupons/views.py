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
from oders.models import Addcart



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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get("coupon")

        if not code:
            return Response({"message": "Coupon required"}, status=400)

        try:
            coupon = Coupons.objects.get(
                coupon=code,   # ✅ FIX HERE
                Is_active=True
            )
        except Coupons.DoesNotExist:
            return Response({"message": "Invalid coupon"}, status=400)

        # Optional validation
        now = timezone.now()

        if coupon.valid_from and coupon.valid_from > now:
            return Response({"message": "Coupon not active yet"}, status=400)

        if coupon.valid_to and coupon.valid_to < now:
            return Response({"message": "Coupon expired"}, status=400)

        cart = Addcart.objects.filter(user=request.user)

        cart_total = sum(item.total_price for item in cart)

        if cart_total < coupon.min_oder_value:
            return Response({
                "message": f"Minimum order is {coupon.min_oder_value}"
            }, status=400)

        discount = (cart_total * coupon.Discount) / 100
        final_amount = cart_total - discount

        return Response({
            "message": "Coupon applied",
            "discount": discount,
            "final_amount": final_amount
        })