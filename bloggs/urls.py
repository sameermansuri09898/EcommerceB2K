from django.urls import path
from rest_framework.routers import DefaultRouter
from .import views

router=DefaultRouter()
router.register('blogg',views.Bloggview,basename='blogg')

urlpatterns = [    
]

urlpatterns += router. urls
