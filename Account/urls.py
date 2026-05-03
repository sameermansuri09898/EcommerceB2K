from django.urls import path,include
from Account.views import RegisterView,LoginView,OtpView,ResendView,Logout,ShippingAddresview, getshippingAddress, setshippingAddress, updateshippingAddress, deleteShippingAddress
urlpatterns = [
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',LoginView.as_view(),name='login'),
    path('resend-otp/',ResendView.as_view(),name='resend_otp'),
    path('otp/',OtpView.as_view(),name='otp'),
    path('logout/',Logout.as_view(),name='logout'),

    # shipping address urls
    path('shippingaddress/',ShippingAddresview.as_view(),name='shippingaddress'),
    path('getshippingaddress/',getshippingAddress.as_view(),name='getshippingaddress'),
    path('setshippingaddress/<int:pk>/',setshippingAddress.as_view(),name='setshippingaddress'),
    path('updateshippingaddress/<int:pk>/',updateshippingAddress.as_view(),name='updateshippingaddress'),
    path('deleteaddress/<int:pk>/',deleteShippingAddress.as_view(),name='deleteaddress'),
   
]