from django.urls import path
from .views import BlogView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'blogg', BlogView, basename='blogg')
urlpatterns = router.urls