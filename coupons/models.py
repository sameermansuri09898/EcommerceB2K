from django.db import models
from Account.models import CustomUser
from django.conf import settings
from django.utils import timezone

now=timezone.now()
class Coupons(models.Model):
  coupon=models.CharField(max_length=30)
  user_usage=models.ManyToManyField(settings.AUTH_USER_MODEL,blank=True)

  Discount=models.DecimalField(max_digits=10,decimal_places=2)
  min_oder_value=models.DecimalField(max_digits=10,decimal_places=2)

  max_coupon=models.PositiveIntegerField(default=100)
  used_coupon=models.PositiveIntegerField()

  valid_from=models.DateTimeField()
  valid_to=models.DateTimeField()
  Is_active=models.BooleanField(default=True)

  def valid_coupon(self,user,total_cart_Amount):

    if not self.Is_active:
      return False ,"Coupon Offer is Not Active"
    
    if total_cart_Amount <self.min_oder_value:
      return False,f"Coupons is Valid Upto :{self.min_oder_value}"
    
    if now <self.valid_from:
      return False,"Coupons is Not Active Yet"
    
    if now > self.valid_to:
      return False ,"Coupons is Not Active yet"
    
    if self.user_usage.filter(pk=user.pk).exists():
       return False, "You have already used this coupon."
    
    return True ,"Coupon is Applied Successfully"
  

  def save(self,*args,**kwargs):
    if self.max_coupon<=0:
      self.Is_active=False
    super().save(*args,**kwargs)  
  


