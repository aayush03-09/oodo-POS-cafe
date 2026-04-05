from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer, OrderItemSerializer
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kitchen_orders(request):
    """Get all orders that kitchen needs to see (sent, preparing)."""
    orders = Order.objects.filter(
        status__in=['sent', 'preparing']
    ).select_related('table__floor', 'created_by').prefetch_related('items__product').order_by('created_at')
    return Response(OrderSerializer(orders, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, pk):
    """Kitchen updates order status: sent → preparing → served (prepared)."""
    try:
        order = Order.objects.select_related('table__floor').prefetch_related('items__product').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    valid_transitions = {
        'sent': ['preparing'],
        'preparing': ['served'],
    }
    allowed = valid_transitions.get(order.status, [])
    if new_status not in allowed:
        return Response({'error': f'Cannot transition from {order.status} to {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    order.save()

    # Update item-level kitchen status to match
    if new_status == 'preparing':
        order.items.all().update(kitchen_status='preparing')
    elif new_status == 'served':
        order.items.all().update(kitchen_status='completed', is_prepared=True)

    # Broadcast update via WebSocket
    try:
        channel_layer = get_channel_layer()
        order.refresh_from_db()
        order_data = OrderSerializer(order).data
        async_to_sync(channel_layer.group_send)('kitchen', {
            'type': 'kitchen_order_update',
            'order': json.loads(json.dumps(order_data, default=str)),
        })
    except Exception:
        pass

    return Response(OrderSerializer(order).data)
