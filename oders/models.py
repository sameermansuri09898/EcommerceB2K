from django.db import models
from Account.models import CustomUser
from django.conf import settings
from django.utils.crypto import get_random_string

class Product(models.Model):
    user=models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255,default="")

    brand=models.CharField(max_length=100)
    description=models.TextField()
    category=models.CharField(max_length=100,default="other")
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True) 


    def __str__(self):
        return self.name
  
class productimage(models.Model):
    image=models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url

class colorvarient(models.Model):

    color=models.CharField(max_length=100,unique=True)

    def __str__(self):
        return self.color

class sizevarient(models.Model):
    size=models.CharField(max_length=100,unique=True)

    def __str__(self):
        return self.size        

class variant(models.Model):
    seller=models.ForeignKey(CustomUser, on_delete=models.CASCADE,default=1)
    product=models.ForeignKey(Product, on_delete=models.CASCADE,related_name='variant_set')
    colors=models.ForeignKey(colorvarient, on_delete=models.CASCADE)
    sizes=models.ForeignKey(sizevarient, on_delete=models.CASCADE)
    stock=models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    offer=models.DecimalField(max_digits=10, decimal_places=2)
    is_available=models.BooleanField(default=True)
    # images=models.ImageField(upload_to='variant_images/')
    images=models.URLField(default="",blank=True,null=True)
    


    def save(self, *args, **kwargs):
        if self.stock <=0:
            self.is_available = False
        super().save(*args, **kwargs)

    def final_price(self):
        return self.price - (self.price * self.offer / 100)

    def offer_price(self):
        return  self.price - self.final_price()    

    def __str__(self):
        return f"{self.product.name} - {self.colors.color} - {self.sizes.size}"




# class Status(models.TextChoices):
#     PENDING = 'pending','pending'
#     PROCESSING = 'processing','processing'
#     SHIPPED = 'shipped','shipped'
#     DELIVERED = 'delivered','delivered'
#     CANCEL = 'cancel','cancel' 

# class PaymentStatus(models.TextChoices):
#     PENDING = 'pending','pending'
#     COMPLETED = 'completed','completed'
#     FAILED = 'failed','failed'

# class PaymentMethod(models.TextChoices):
#     COD = 'COD','COD'
#     ONLINE = 'ONLINE','ONLINE'



class Addcart(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product_item=models.ForeignKey(Product, on_delete=models.CASCADE)
    product_varient=models.ForeignKey(variant, on_delete=models.CASCADE)
    total_price=models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price=models.DecimalField(max_digits=10, decimal_places=2)
    amount_saved=models.DecimalField(max_digits=10, decimal_places=2)
    quantity=models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True) 
    is_cart = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.quantity <=0:
            self.quantity = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.product_item.name 
