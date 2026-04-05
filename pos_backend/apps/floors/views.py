from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Floor, Table
from .serializers import FloorSerializer, TableSerializer

class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.prefetch_related('tables').all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]

class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.select_related('floor').all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]
