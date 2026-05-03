from django.contrib import admin
from .models import SellerProfile

@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'shop_city', 'shop_state', 'shop_phone', 'shop_email', 'is_verified','user','pan_number','gst_number','aadhaar_number','bank_account_number','bank_ifsc_code','bank_name','bank_branch','bank_account_holder_name','shop_description','shop_logo','shop_banner','address','shop_zip_code')

    search_fields=('shop_name','shop_city','shop_state','shop_phone','shop_email','is_verified','user','pan_number','gst_number','aadhaar_number','bank_account_number','bank_ifsc_code','bank_name','bank_branch','bank_account_holder_name','shop_description','shop_logo','shop_banner','address','shop_zip_code')
    list_filter=('shop_city','shop_state','is_verified','user','pan_number','gst_number','aadhaar_number','bank_account_number','bank_ifsc_code','bank_name','bank_branch','bank_account_holder_name','shop_description','shop_logo','shop_banner','address','shop_zip_code')
