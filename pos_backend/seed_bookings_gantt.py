import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pos_backend.settings')
django.setup()

from apps.bookings.models import Booking
from apps.floors.models import Table
import random

today = date.today()

tables = list(Table.objects.all())

if not tables:
    print("No tables exist to assign bookings to!")
    exit(1)

# Generate exactly 12 active bookings spread across the day
time_slots = [
    ("10:00:00", "11:30:00"),
    ("11:30:00", "12:30:00"),
    ("12:00:00", "13:30:00"),
    ("13:00:00", "14:30:00"),
    ("14:00:00", "15:00:00"),
    ("15:00:00", "16:30:00"),
    ("16:00:00", "17:30:00"),
    ("18:00:00", "19:30:00"),
    ("19:00:00", "20:30:00"),
    ("19:30:00", "21:00:00"),
    ("20:00:00", "22:00:00"),
    ("21:00:00", "22:30:00"),
]

customers = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Niaj"]

from apps.authentication.models import User
admin_user = User.objects.filter(role='admin').first()

count = 0
for start, end in time_slots:
    table = random.choice(tables)
    party_size = random.randint(1, table.seats)
    Booking.objects.create(
        customer_name=customers[count],
        customer_phone=f"555-010{count}",
        party_size=party_size,
        booking_date=today,
        time_slot_start=start,
        time_slot_end=end,
        status='confirmed',
        table=table,
        created_by=admin_user,
        notes="Gantt chart seeded booking"
    )
    count += 1

print(f"Successfully seeded {count} bookings for today ({today}) on the Gantt chart.")
