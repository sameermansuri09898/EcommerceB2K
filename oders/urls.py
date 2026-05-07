from django.urls import path
from .import views
from rest_framework.routers import DefaultRouter



router=DefaultRouter()
router.register('product',views.productViewSet, basename='product')
router.register('variant',views.ProductVraientViewSet, basename='variant')


urlpatterns = router.urls
