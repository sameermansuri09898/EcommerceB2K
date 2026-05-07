from django.urls import path
from .import views
from rest_framework.routers import DefaultRouter



router=DefaultRouter()
router.register('product',views.productViewSet, basename='product')
router.register('variant',views.ProductVraientViewSet, basename='variant')



urlpatterns=[
  path('productlist/',views.ProductAndVariantListView.as_view(),name='product_and_variant_list'),
  
]
urlpatterns += router.urls
