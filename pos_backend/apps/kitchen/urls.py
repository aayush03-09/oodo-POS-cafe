from django.urls import path
from . import views

urlpatterns = [
    path('orders/', views.kitchen_orders, name='kitchen_orders'),
    path('orders/<int:pk>/status/', views.update_order_status, name='update_order_status'),
]
