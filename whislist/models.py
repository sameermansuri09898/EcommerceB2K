from django.db import models
from django.conf import settings
from oders.models import Product,variant

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product_item = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_varient = models.ForeignKey(variant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.product_item} - {self.product_varient}"