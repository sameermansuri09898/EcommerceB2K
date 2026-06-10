from django.urls import path,include
from Account.views import RegisterView,LoginView,OtpView,ResendView,Logout
from .views import  *
urlpatterns = [
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',LoginView.as_view(),name='login'),
    path('resend-otp/',ResendView.as_view(),name='resend_otp'),
    path('otp/',OtpView.as_view(),name='otp'),
    path('logout/',Logout.as_view(),name='logout'),

    # shipping address urls
     path(
        'shipping/create/',
        ShippingAddressCreate.as_view()
    ),

    path(
        'shipping/list/',
        ShippingAddressList.as_view()
    ),

    path(
        'shipping/update/<int:id>/',
        ShippingAddressUpdate.as_view()
    ),

    path(
        'shipping/delete/<int:id>/',
        ShippingAddressDelete.as_view()
    ),

    path(
        'shipping/default/<int:id>/',
        SetDefaultAddress.as_view()
    ),

    path(
        'shipping/current-default/',
        DefaultAddress.as_view()
    ),
   
]