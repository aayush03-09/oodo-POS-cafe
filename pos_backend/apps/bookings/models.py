from django.db import models
from django.conf import settings
from apps.floors.models import Table

class Booking(models.Model):
    STATUS_CHOICES = (
        ('confirmed', 'Confirmed'),
        ('seated', 'Seated'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    party_size = models.IntegerField(default=2)
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    booking_date = models.DateField()
    time_slot_start = models.TimeField()
    time_slot_end = models.TimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='confirmed')
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['booking_date', 'time_slot_start']

    def __str__(self):
        return f"{self.customer_name} - {self.booking_date} {self.time_slot_start}"
