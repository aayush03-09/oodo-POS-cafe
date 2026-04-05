from django.urls import path
from . import views

urlpatterns = [
    path('', views.booking_list_create, name='booking_list_create'),
    path('<int:pk>/', views.booking_detail, name='booking_detail'),
    path('<int:pk>/status/', views.booking_update_status, name='booking_update_status'),
    path('calendar/', views.booking_calendar, name='booking_calendar'),
    path('gantt/', views.booking_gantt, name='booking_gantt'),
    path('history/', views.booking_history, name='booking_history'),
]
