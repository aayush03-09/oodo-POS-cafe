from django.db import models
from django.conf import settings
from apps.floors.models import Table
from apps.products.models import Product
from apps.payment_methods.models import PaymentMethod

class Order(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent to Kitchen'),
        ('preparing', 'Preparing'),
        ('served', 'Served'),
        ('paid', 'Paid'),
    )
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=10, choices=(('pending', 'Pending'), ('done', 'Done')), default='pending')

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            last = Order.objects.order_by('-id').first()
            self.order_number = str((last.id + 1) if last else 1).zfill(4)
        super().save(*args, **kwargs)

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

class OrderItem(models.Model):
    KITCHEN_STATUS_CHOICES = (
        ('to_cook', 'To Cook'),
        ('preparing', 'Preparing'),
        ('completed', 'Completed'),
    )
    TYPE_CHOICES = (
        ('regular', 'Regular'),
        ('jain', 'Jain'),
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    kitchen_status = models.CharField(max_length=15, choices=KITCHEN_STATUS_CHOICES, default='to_cook')
    is_prepared = models.BooleanField(default=False)
    customization_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='regular')
    note = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='confirmed')

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"Payment for Order #{self.order.order_number} - {self.amount}"
