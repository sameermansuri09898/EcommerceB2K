from django.urls import path
from .views import Blogview,Retreaveproductbloggs,ListBlog

urlpatterns = [
    path('createblogg/', Blogview.as_view(), name='createblogg'),
    path('blog/<int:pk>/', Blogview.as_view(), name='blog'),
    path('retreaveblogg/<int:pk>', Retreaveproductbloggs.as_view(), name='retreaveblogg'),
    path('listblog/', ListBlog.as_view(), name='listblog'),
]
