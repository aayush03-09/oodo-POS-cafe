from django.urls import path
from . import views

urlpatterns = [
    path('orders/', views.order_list_create, name='order_list_create'),
    path('orders/<int:pk>/', views.order_detail, name='order_detail'),
    path('orders/<int:pk>/items/', views.add_item, name='add_item'),
    path('orders/<int:pk>/send-to-kitchen/', views.send_to_kitchen, name='send_to_kitchen'),
    path('orders/<int:pk>/mark-served/', views.mark_served, name='mark_served'),
    path('orders/<int:pk>/pay/', views.pay_order, name='pay_order'),
    path('orders/<int:pk>/receipt/', views.order_receipt, name='order_receipt'),
    path('order-items/<int:pk>/', views.update_delete_item, name='update_delete_item'),
]
