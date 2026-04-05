from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    floor_name = serializers.CharField(source='table.floor.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']
