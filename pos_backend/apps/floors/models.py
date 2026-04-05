from django.db import models

class Floor(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'floors'

    def __str__(self):
        return self.name

class Table(models.Model):
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='tables')
    table_number = models.CharField(max_length=20)
    seats = models.IntegerField(default=2)
    is_active = models.BooleanField(default=True)
    appointment_resource = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        db_table = 'tables'

    def __str__(self):
        return f"Table {self.table_number} ({self.floor.name})"
