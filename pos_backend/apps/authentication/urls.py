from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.me, name='me'),
    path('reset-kitchen-pin/', views.reset_kitchen_pin, name='reset_kitchen_pin'),
    path('get-kitchen-pin/', views.get_kitchen_pin, name='get_kitchen_pin'),
]
