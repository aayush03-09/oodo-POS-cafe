import uuid
from django.db import models
from apps.floors.models import Table

class SelfOrderToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='self_order_tokens')
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'self_order_tokens'

    def __str__(self):
        return f"Token {self.token} for Table {self.table.table_number}"
