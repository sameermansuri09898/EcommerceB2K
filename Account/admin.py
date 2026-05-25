from django.contrib import admin
from .models import Otp,CustomUser,BuyerShipping

# Register your models here.
admin.site.register(Otp)
admin.site.register(BuyerShipping)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
  list_display=['id']