from django.db import models
from django.contrib.auth import get_user_model
from oders.models import Product,variant
from django.conf import settings

class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='ratings')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variants = models.ForeignKey(variant, on_delete=models.CASCADE)
    rating = models.IntegerField()
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product', 'variants')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.variants.color_name}): {self.rating} stars"