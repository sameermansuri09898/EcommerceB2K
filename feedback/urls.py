from django.urls import path
from .views import ProductVariantRatingsListView

urlpatterns = [
    # Aapka exact endpoint path yahan register hoga
    path('ratings/', ProductVariantRatingsListView.as_view(), name='product-variant-ratings'),
]