from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='piece')
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True) 
    send_to_kitchen = models.BooleanField(default=True)
    

    class Meta:
        db_table = 'products'

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    attribute = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'product_variants'

    def __str__(self):
        return f"{self.product.name} - {self.attribute}: {self.value}"
