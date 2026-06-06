from django.urls import path
from .import views

from rest_framework.routers import DefaultRouter



router=DefaultRouter()
router.register('product',views.productViewSet, basename='product')
router.register('variant',views.ProductVraientViewSet, basename='variant')



urlpatterns=[
  path('productlist/',views.ProductAndVariantListView.as_view(),name='product_and_variant_list'),
  path('addcart/',views.AddToCartView.as_view(),name='addcart'),
  path('viewcart/',views.ViewCart.as_view(),name='viewcart'),
  path('deletecart/', views.DeleteCartItemView.as_view(), name='deletecart'),
  path('updatecart/',views.UpdateCart.as_view(),name='updatecart'),
  path('Retreave_product/<int:pk>/', views.ProductDetailView.as_view(), name='get_cart_details'),

  # categories data
  path('Categoriesdata/',views.Categoriesdata.as_view(),name="catdata"),
  path('OfferOrders/',views.OfferOrders.as_view(),name="offerdata"),
  path('VariantSizeView/',views.VariantSizeView.as_view(),name="VariantSizeView"),
  path('VariantColorView/',views.VariantColorView.as_view(),name="VariantColorView"),

  
]
urlpatterns += router.urls
