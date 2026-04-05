from django.urls import path
from . import views

urlpatterns = [
    path('token/', views.generate_token, name='generate_token'),
    path('place/', views.place_order, name='place_order'),
    path('menu/', views.get_menu, name='self_order_menu'),
]
