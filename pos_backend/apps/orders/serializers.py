from rest_framework import serializers
from .models import Order, OrderItem, Payment

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'quantity',
                  'unit_price', 'subtotal', 'kitchen_status', 'is_prepared', 
                  'customization_type', 'note']
        read_only_fields = ['subtotal']

class PaymentSerializer(serializers.ModelSerializer):
    method_name = serializers.CharField(source='method.name', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'order', 'method', 'method_name', 'amount', 'paid_at', 'status']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    floor_name = serializers.CharField(source='table.floor.name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'floor_name', 'order_number',
                  'status', 'payment_status', 'created_by', 'created_by_name', 'created_at',
                  'items', 'payments', 'total']
        read_only_fields = ['order_number', 'created_by', 'created_at']
