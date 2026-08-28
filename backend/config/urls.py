from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/orders/',   include('orders.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/admin/',    include('admin_api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = "F&H BAGS Admin"
admin.site.site_title  = "F&H BAGS"
admin.site.index_title = "Gestion Boutique"
