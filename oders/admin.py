from django.contrib import admin
from .models import Product,colorvarient,sizevarient,variant,Addcart,Categoriesvarient


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display=['id','name']
    search_fields=['name','brand']

@admin.register(variant)
class variantAdmin(admin.ModelAdmin):
    list_display=['seller','product','colors','sizes','stock','price','offer','is_available','images']
    search_fields=['product']
@admin.register(colorvarient)
class colorvarientAdmin(admin.ModelAdmin):
    list_display=['id','color']

@admin.register(sizevarient)
class sizevarientAdmin(admin.ModelAdmin):
    list_display=['id','size']

@admin.register(Addcart)
class AddcartAdmin(admin.ModelAdmin):
    list_display=['id','user','product_item','product_varient','total_price','discounted_price','amount_saved','quantity','created_at','updated_at','is_cart']
    list_filter=['is_cart','created_at','updated_at']
    search_fields=['user__username','product_item__name','product_varient__colors__color','product_varient__sizes__size']


@admin.register(Categoriesvarient)
class CategoriesvarientAdmin(admin.ModelAdmin):
    list_display=['categorie',]