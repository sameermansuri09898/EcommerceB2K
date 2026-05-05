from django.db import models
from Account.models import CustomUser
from django.conf import settings

class Category(models.Model):
    name=models.CharField(max_length=100)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='images')
    image=models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url


class Productcolorvarient(models.Model):
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='colors')
    color=models.CharField(max_length=100)

    def __str__(self):
        return self.color

class Productsizevarient(models.Model):
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='sizes')
    size=models.CharField(max_length=100)

    def __str__(self):
        return self.size


class Product(models.Model):
    seller=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='products')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    brand=models.CharField(max_length=100)
    description=models.TextField()
    color=models.ForeignKey(Productcolorvarient, on_delete=models.CASCADE,related_name='colors')
    size=models.ForeignKey(Productsizevarient, on_delete=models.CASCADE,related_name='sizes')
    category=models.ForeignKey(Category, on_delete=models.CASCADE,related_name='products')
    images=models.ForeignKey(ProductImage, on_delete=models.CASCADE,related_name='images')
    
    created_at = models.DateTimeField(auto_now_add=True) 


class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ], default='pending')

    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)    