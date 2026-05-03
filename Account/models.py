from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    mobile_number = models.CharField()
    is_verified = models.BooleanField(default=False)
    role = models.CharField( choices=[('customer', 'Customer'), ('seller', 'Seller')])
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    def __str__(self):
        return self.username

class Otp(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='otp')
    otp=models.IntegerField()
    is_verified=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username


    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)
    
  


  

# class CustumerBuyer(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='custumer')
#     address = models.TextField(blank=True)
#     city = models.CharField(max_length=100, blank=True)
#     state = models.CharField(max_length=100, blank=True)
#     zip_code = models.CharField(max_length=10, blank=True)
#     landmark = models.CharField(max_length=100, blank=True)

#     def __str__(self):
#         return self.user.username
    

    

    

    
    
