from django.contrib import admin
from .models import Product,productimage,colorvarient,sizevarient


admin.site.register(Product)
admin.site.register(productimage)
admin.site.register(colorvarient)
admin.site.register(sizevarient)
