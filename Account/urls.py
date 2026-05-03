from django.urls import path,include
from Account.views import RegisterView,LoginView,OtpView,ResendView,Logout
urlpatterns = [
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',LoginView.as_view(),name='login'),
    path('resend-otp/',ResendView.as_view(),name='resend_otp'),
    path('otp/',OtpView.as_view(),name='otp'),
    path('logout/',Logout.as_view(),name='logout'),
   
]