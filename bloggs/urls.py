from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import Bloggview

urlpatterns = [
    path('blogg/', Bloggview.as_view(), name='blogg'),  
    path('blogg/<int:id>/', Bloggview.as_view(), name='blogg'),
]