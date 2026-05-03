from django.db import models
from django.conf import settings
"""
 block for products 
"""


class Productbloggs(models.Model):
  user=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  name = models.CharField(max_length=100)
  description = models.TextField()
  price = models.DecimalField(max_digits=10, decimal_places=2)
  image = models.ImageField(upload_to='product_images/')

  area=models.CharField(max_length=100)
  city=models.CharField(max_length=100)
  state=models.CharField(max_length=100)
  country=models.CharField(max_length=100)
  pincode=models.CharField(max_length=6)
  


  def __str__(self):
    return self.name
