from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Order
import qrcode
import io
import base64

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_qr(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    from apps.payment_methods.models import PaymentMethod
    upi_method = PaymentMethod.objects.filter(name='UPI', is_enabled=True).first()
    upi_id = upi_method.upi_id if upi_method else '123@ybl.com'
    
    upi_string = f"upi://pay?pa={upi_id}&pn=POSCafe&am={order.total}&cu=INR"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(upi_string)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return Response({
        'qr_image': f'data:image/png;base64,{img_base64}',
        'upi_id': upi_id,
        'amount': str(order.total),
        'order_number': order.order_number,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    order_id = request.data.get('order_id')
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    from apps.payment_methods.models import PaymentMethod
    from .models import Payment
    
    upi_method = PaymentMethod.objects.filter(name='UPI').first()
    Payment.objects.create(
        order=order,
        method=upi_method,
        amount=order.total,
        status='confirmed',
    )
    order.status = 'paid'
    order.save()
    return Response({'status': 'confirmed', 'amount': str(order.total)})

urlpatterns = [
    path('qr/<int:order_id>/', generate_qr, name='generate_qr'),
    path('confirm/', confirm_payment, name='confirm_payment'),
]
