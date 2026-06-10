from django.urls import path
from . import views
urlpatterns = [

    path('add-to-wishlist/', views.add_to_wishlist.as_view(), name='add_to_wishlist'),
    path('remove-from-wishlist/', views.remove_from_wishlist.as_view(), name='remove_from_wishlist'),
    path('view-wishlist/', views.WishlistViewSet.as_view(), name='view_wishlist'),   
    
    ]