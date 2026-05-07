from django.db import models
from django.conf import settings
"""
 block for products and user bloggs  
"""


class Productbloggs(models.Model):
  user=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  name = models.CharField(max_length=100)
  description = models.TextField()
  price = models.DecimalField(max_digits=10, decimal_places=2)
  image = models.ImageField(upload_to='product_images/',blank=True,null=True)
  category=models.CharField(max_length=100,choices=[('Fashion','Fashion'),('Electronics','Electronics'),('Home & Kitchen','Home & Kitchen'),('Books & Hobbies','Books & Hobbies'),('Beauty & Personal Care','Beauty & Personal Care'),('Other','Other')],default='Fashion')
  subcategory=models.CharField(max_length=100,default='Unknown')
  brand=models.CharField(max_length=100,default='Unknown')
  area=models.CharField(max_length=100)


  


  def __str__(self):
    return self.name
