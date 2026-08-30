from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

urlpatterns = [
    # منع أخطاء favicon 400/404
    path('favicon.ico', lambda request: HttpResponse(status=204)),
    
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/orders/',   include('orders.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/admin/',    include('admin_api.urls')),
]

# تقديم ملفات الـ Media فقط في بيئة التطوير المحلية
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "F&H BAGS Admin"
admin.site.site_title  = "F&H BAGS"
admin.site.index_title = "Gestion Boutique"