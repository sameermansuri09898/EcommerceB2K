from django.db import models
from Account.models import CustomUser
from django.conf import settings


class Product(models.Model):
    user=models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    offer=models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    brand=models.CharField(max_length=100)
    description=models.TextField()
    category=models.CharField(max_length=100,default="other")
    is_available=models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True) 

    def final_price(self):
        return self.price - (self.price * self.offer / 100)


    def offer_price(self):
        return  self.price - self.final_price()

    def save(self, *args, **kwargs):
        if self.stock <=0:
            self.is_available = False
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class productimage(models.Model):
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='images')
    image=models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url

class colorvarient(models.Model):
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='colors')
    color=models.CharField(max_length=100)

    def __str__(self):
        return self.color

class sizevarient(models.Model):
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='sizes')
    size=models.CharField(max_length=100)

    def __str__(self):
        return self.size        

