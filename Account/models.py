from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

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

# class CustumerBuyer(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='custumer')
#     address = models.TextField(blank=True)
#     city = models.CharField(max_length=100, blank=True)
#     state = models.CharField(max_length=100, blank=True)
#     zip_code = models.CharField(max_length=10, blank=True)
#     landmark = models.CharField(max_length=100, blank=True)

#     def __str__(self):
#         return self.user.username
    

# class SellerProfile(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='seller_profile')
#     shop_name = models.CharField(max_length=100)
#     shop_description = models.TextField(blank=True)
#     shop_logo = models.ImageField(upload_to='shop_logos/', blank=True, null=True)
#     shop_banner = models.ImageField(upload_to='shop_banners/', blank=True, null=True)
#     address = models.TextField(blank=True)
#     shop_city = models.CharField(max_length=100, blank=True)
#     shop_state = models.CharField(max_length=100, blank=True)
#     shop_zip_code = models.CharField(max_length=10, blank=True)
#     shop_phone = models.CharField(max_length=15, blank=True)
#     shop_email = models.EmailField(blank=True)
#     pan_number = models.CharField(max_length=10, blank=True)
#     gst_number = models.CharField(max_length=15, blank=True)
#     aadhaar_number = models.CharField(max_length=12, blank=True)
#     bank_account_number = models.CharField(max_length=20, blank=True)
#     bank_ifsc_code = models.CharField(max_length=11, blank=True)
#     bank_name = models.CharField(max_length=100, blank=True)
#     bank_branch = models.CharField(max_length=100, blank=True)
#     bank_account_holder_name = models.CharField(max_length=100, blank=True)
#     bank_account_type = models.CharField(max_length=10, blank=True)

#     def __str__(self):
#         return self.shop_name
    

    

    
    
