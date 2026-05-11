from django.urls import path
from .import views

from rest_framework.routers import DefaultRouter



router=DefaultRouter()
router.register('product',views.productViewSet, basename='product')
router.register('variant',views.ProductVraientViewSet, basename='variant')



urlpatterns=[
  path('productlist/',views.ProductAndVariantListView.as_view(),name='product_and_variant_list'),
  path('addcart/',views.AddToCartView.as_view(),name='addcart'),
  path('viewcart/',views.Viewcart.as_view(),name='viewcart'),
  path('updatecart/',views.Viewcart.as_view(),name='updatecart'),
  
]
urlpatterns += router.urls
