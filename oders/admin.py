from django.contrib import admin
from .models import Product,colorvarient,sizevarient,variant,Addcart


admin.site.register(Product)

@admin.register(variant)
class variantAdmin(admin.ModelAdmin):
    list_display=['product','colors','sizes','stock','price','offer','is_available','images']
@admin.register(colorvarient)
class colorvarientAdmin(admin.ModelAdmin):
    list_display=['id','color']

@admin.register(sizevarient)
class sizevarientAdmin(admin.ModelAdmin):
    list_display=['id','size']

@admin.register(Addcart)
class AddcartAdmin(admin.ModelAdmin):
    list_display=['user','product_item','product_varient','total_price','discounted_price','amount_saved','quantity','created_at','updated_at','is_cart']
