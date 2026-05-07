from django.contrib import admin
from .models import Product,productimage,colorvarient,sizevarient,variant


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
