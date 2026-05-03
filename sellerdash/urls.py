from django.urls import path,include
from .views import selleaccount,Itpverification,resendotp


urlpatterns = [
  path('selleraccount/',selleaccount.as_view(),name='selleraccount'),
  path('otpverification/',Itpverification.as_view(),name='itpverification'),
  path('resendotp/',resendotp.as_view(),name='resendotp'),  
]