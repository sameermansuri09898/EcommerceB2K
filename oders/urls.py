from django.urls import path
from .import views
from rest_framework.routers import DefaultRouter

router=DefaultRouter()
router.register('product',views.productViewSet, basename='products')

urlpatterns = router.urls
