from django.urls import path,include
from .views import CouponCreateView,ApplyCoupon
urlpatterns = [
    path('Coupon/',CouponCreateView.as_view()),
    path('Coupon_Apply/',ApplyCoupon.as_view()),
]