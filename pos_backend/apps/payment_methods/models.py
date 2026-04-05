from django.db import models

class PaymentMethod(models.Model):
    name = models.CharField(max_length=50)
    is_enabled = models.BooleanField(default=True)
    upi_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'payment_methods'

    def __str__(self):
        return self.name
