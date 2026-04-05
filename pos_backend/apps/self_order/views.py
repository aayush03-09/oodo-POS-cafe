from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import SelfOrderToken
from .serializers import SelfOrderTokenSerializer
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer
from apps.products.models import Product
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_token(request):
    table_id = request.data.get('table')
    token = SelfOrderToken.objects.create(table_id=table_id)
    return Response(SelfOrderTokenSerializer(token).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def place_order(request):
    token_str = request.data.get('token')
    try:
        token = SelfOrderToken.objects.get(token=token_str, is_used=False)
    except SelfOrderToken.DoesNotExist:
        return Response({'error': 'Invalid or used token'}, status=status.HTTP_400_BAD_REQUEST)
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    bot_user, _ = User.objects.get_or_create(username='self_order_bot')

    order = Order.objects.create(
        table=token.table,
        created_by=bot_user,
        order_number=str(token.token)[:8],
        status='sent',
    )
    
    items_data = request.data.get('items', [])
    for item_data in items_data:
        product = Product.objects.get(id=item_data['product'])
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item_data.get('quantity', 1),
            unit_price=product.price,
        )
    
    token.is_used = True
    token.save()
    
    # Send to kitchen via WebSocket
    try:
        channel_layer = get_channel_layer()
        order_data = OrderSerializer(order).data
        async_to_sync(channel_layer.group_send)(
            'kitchen',
            {
                'type': 'kitchen_order',
                'order': json.loads(json.dumps(order_data, default=str)),
            }
        )
    except Exception:
        pass
    
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_menu(request):
    products = Product.objects.filter(is_active=True).select_related('category')
    from apps.products.serializers import ProductSerializer
    return Response(ProductSerializer(products, many=True).data)
