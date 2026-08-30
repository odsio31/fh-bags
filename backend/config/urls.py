from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse
from django.db import connection
from django.views.static import serve as serve_static
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

# django.conf.urls.static.static() refuses to serve anything when DEBUG=False,
# so it's a no-op in production even without this DEBUG guard. Media (user
# uploads) has nothing else serving it there -- WhiteNoise only covers
# STATIC_ROOT -- so register the static view for /media/ unconditionally.
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
]

admin.site.site_header = "F&H BAGS Admin"
admin.site.site_title  = "F&H BAGS"
admin.site.index_title = "Gestion Boutique"