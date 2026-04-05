from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PaymentMethod
from .serializers import PaymentMethodSerializer

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
