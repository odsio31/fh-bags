from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse
from django.db import connection
import logging

logger = logging.getLogger(__name__)


def health(request):
    info = {'database': connection.vendor, 'debug': settings.DEBUG}

    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        info['connection_ok'] = True
    except Exception:
        logger.exception('health check: DB connection failed')
        info['connection_ok'] = False
        return JsonResponse(info, status=500)

    try:
        table_names = connection.introspection.table_names()
        info['table_count'] = len(table_names)
        info['has_auth_user_table'] = 'auth_user' in table_names
    except Exception:
        logger.exception('health check: introspection failed')

    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        info['user_count'] = User.objects.count()
        info['superuser_count'] = User.objects.filter(is_superuser=True).count()
    except Exception:
        logger.exception('health check: user query failed')

    return JsonResponse(info)


urlpatterns = [
    # منع أخطاء favicon 400/404
    path('favicon.ico', lambda request: HttpResponse(status=204)),

    path('api/health/', health),
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