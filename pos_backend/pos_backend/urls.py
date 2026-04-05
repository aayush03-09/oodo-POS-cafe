from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.floors.urls')),
    path('api/', include('apps.payment_methods.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/kitchen/', include('apps.kitchen.urls')),
    path('api/self-order/', include('apps.self_order.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/payment/', include('apps.orders.payment_urls')),
    path('api/bookings/', include('apps.bookings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
