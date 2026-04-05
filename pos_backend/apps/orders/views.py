from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order, OrderItem, Payment
from .serializers import OrderSerializer, OrderItemSerializer, PaymentSerializer
from apps.products.models import Product
import json

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_list_create(request):
    if request.method == 'GET':
        orders = Order.objects.select_related('table__floor', 'created_by').prefetch_related('items__product', 'payments__method').all()
        table_id = request.query_params.get('table')
        status_filter = request.query_params.get('status')
        payment_status = request.query_params.get('payment_status')
        if table_id:
            orders = orders.filter(table_id=table_id)
        if status_filter:
            orders = orders.filter(status=status_filter)
        if payment_status:
            orders = orders.filter(payment_status=payment_status)
        return Response(OrderSerializer(orders, many=True).data)

    if request.method == 'POST':
        order = Order.objects.create(
            table_id=request.data.get('table'),
            created_by=request.user,
        )
        items_data = request.data.get('items', [])
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data.get('quantity', 1),
                unit_price=product.price,
                customization_type=item_data.get('customization_type', 'regular'),
                note=item_data.get('note', ''),
            )
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    try:
        order = Order.objects.select_related('table__floor', 'created_by').prefetch_related('items__product', 'payments__method').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(OrderSerializer(order).data)

    if request.method == 'PUT':
        order.status = request.data.get('status', order.status)
        order.save()
        return Response(OrderSerializer(order).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_item(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    product = Product.objects.get(id=request.data['product'])
    existing = order.items.filter(product=product).first()
    if existing:
        existing.quantity += request.data.get('quantity', 1)
        existing.save()
        item = existing
    else:
        item = OrderItem.objects.create(order=order, product=product, quantity=request.data.get('quantity', 1), unit_price=product.price)
    return Response(OrderItemSerializer(item).data, status=status.HTTP_201_CREATED)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_delete_item(request, pk):
    try:
        item = OrderItem.objects.get(pk=pk)
    except OrderItem.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        item.quantity = request.data.get('quantity', item.quantity)
        item.save()
        return Response(OrderItemSerializer(item).data)

    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_to_kitchen(request, pk):
    try:
        order = Order.objects.select_related('table__floor').prefetch_related('items__product').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    order.status = 'sent'
    order.save()

    try:
        channel_layer = get_channel_layer()
        order_data = OrderSerializer(order).data
        async_to_sync(channel_layer.group_send)('kitchen', {
            'type': 'kitchen_order',
            'order': json.loads(json.dumps(order_data, default=str)),
        })
    except Exception:
        pass

    return Response(OrderSerializer(order).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_served(request, pk):
    """Staff marks order as served to customer."""
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    order.status = 'served'
    order.save()
    return Response(OrderSerializer(order).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    payment = Payment.objects.create(
        order=order,
        method_id=request.data.get('method'),
        amount=request.data.get('amount', order.total),
        status='confirmed',
    )
    order.status = 'paid'
    order.payment_status = 'done'
    order.save()
    return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_receipt(request, pk):
    """Generate receipt data for a paid order."""
    try:
        order = Order.objects.select_related('table__floor', 'created_by').prefetch_related('items__product', 'payments__method').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    items = [{
        'name': item.product.name,
        'qty': item.quantity,
        'unit_price': float(item.unit_price),
        'subtotal': float(item.subtotal),
    } for item in order.items.all()]

    payment = order.payments.first()

    return Response({
        'order_number': order.order_number,
        'table_number': order.table.table_number if order.table else '-',
        'staff': order.created_by.username,
        'date': order.created_at.strftime('%d %b %Y, %I:%M %p'),
        'items': items,
        'total': float(order.total),
        'payment_method': payment.method.name if payment and payment.method else '-',
        'payment_status': order.payment_status,
    })
