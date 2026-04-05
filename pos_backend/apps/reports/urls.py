from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('sales/', views.sales_report, name='sales_report'),
    path('export/pdf/', views.export_pdf, name='export_pdf'),
    path('export/xls/', views.export_xls, name='export_xls'),
]
