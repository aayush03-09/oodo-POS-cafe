from rest_framework import serializers
from .models import Floor, Table

class TableSerializer(serializers.ModelSerializer):
    is_occupied = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = '__all__'

    def get_is_occupied(self, obj):
        # A table is occupied if it has any orders that have not yet been fully paid
        return obj.orders.filter(payment_status='pending').exists()

class FloorSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)

    class Meta:
        model = Floor
        fields = ['id', 'name', 'is_active', 'tables']
