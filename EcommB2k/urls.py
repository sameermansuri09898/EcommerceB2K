from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path('api/',include('Account.urls')),
    path('api/',include('carts.urls')),
    path('api/',include('oders.urls')),
    path('api/',include('products.urls')),
    path('api/',include('categories.urls')),
    path('api/',include('coupons.urls')),
    path('api/',include('payments.urls')),
    path('api/',include('whislist.urls')),
    path('api/',include('feedback.urls')),
    path('api/',include('bloggs.urls')),
    path('api/',include('sellerdash.urls')),
    path('api/',include('emailapp.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)        