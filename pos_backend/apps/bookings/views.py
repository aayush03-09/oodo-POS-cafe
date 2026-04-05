from datetime import datetime, timedelta
from django.db.models import Count, Sum, F, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
from apps.floors.models import Table

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def booking_list_create(request):
    if request.method == 'GET':
        bookings = Booking.objects.select_related('table__floor', 'created_by').all()
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')
        if date_from:
            bookings = bookings.filter(booking_date__gte=date_from)
        if date_to:
            bookings = bookings.filter(booking_date__lte=date_to)
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        return Response(BookingSerializer(bookings, many=True).data)

    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def booking_detail(request, pk):
    try:
        booking = Booking.objects.select_related('table__floor', 'created_by').get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(BookingSerializer(booking).data)

    if request.method == 'PUT':
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    booking.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def booking_update_status(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    new_status = request.data.get('status')
    if new_status in dict(Booking.STATUS_CHOICES):
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)
    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_calendar(request):
    """Return booking counts per day for the last 30 days + next 30 days."""
    today = timezone.now().date()
    start = today - timedelta(days=30)
    end = today + timedelta(days=30)
    bookings = Booking.objects.filter(
        booking_date__gte=start, booking_date__lte=end
    ).exclude(status='cancelled').values('booking_date').annotate(
        count=Count('id')
    ).order_by('booking_date')
    return Response(list(bookings))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_gantt(request):
    """Return table-wise bookings for Gantt chart display."""
    date = request.query_params.get('date', str(timezone.now().date()))
    bookings = Booking.objects.filter(
        booking_date=date
    ).exclude(status='cancelled').select_related('table__floor').values(
        'id', 'customer_name', 'party_size', 'time_slot_start', 'time_slot_end',
        'status', table_number=F('table__table_number'), floor_name=F('table__floor__name')
    )
    tables = Table.objects.filter(is_active=True).select_related('floor').values(
        'id', 'table_number', 'seats', floor_name=F('floor__name')
    )
    return Response({
        'tables': list(tables),
        'bookings': list(bookings),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_history(request):
    """Past 30 days of booking history."""
    today = timezone.now().date()
    start = today - timedelta(days=30)
    bookings = Booking.objects.filter(
        booking_date__gte=start, booking_date__lte=today
    ).select_related('table__floor', 'created_by').order_by('-booking_date', '-time_slot_start')
    return Response(BookingSerializer(bookings, many=True).data)
