from rest_framework import serializers
from .models import SelfOrderToken

class SelfOrderTokenSerializer(serializers.ModelSerializer):
    table_number = serializers.CharField(source='table.table_number', read_only=True)

    class Meta:
        model = SelfOrderToken
        fields = ['id', 'token', 'table', 'table_number', 'session', 'created_at', 'is_used']
