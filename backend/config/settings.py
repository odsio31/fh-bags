import os
from pathlib import Path
from decouple import config
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-fhbags-2025')

IS_RENDER = 'RENDER' in os.environ
DEBUG     = config('DEBUG', default=not IS_RENDER, cast=bool)

ALLOWED_HOSTS = ['fh-bags.onrender.com', 'localhost', '127.0.0.1', '.onrender.com']

# ── CSRF & SSL ────────────────────────────────────────────────
if IS_RENDER:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST    = True
    USE_X_FORWARDED_PORT    = True
    SESSION_COOKIE_SECURE   = True
    CSRF_COOKIE_SECURE      = True
else:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE    = False

CSRF_TRUSTED_ORIGINS = [
    'https://fh-bags.onrender.com',
    'http://localhost:8000',
    'http://localhost:5173',
]

# ── Apps ──────────────────────────────────────────────────────
# ملاحظة: تم وضع Cloudinary قبل staticfiles لمنع التضارب
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    
    'cloudinary_storage',
    'cloudinary',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'products',
    'orders',
    'admin_api',
    'shipping',
]

# ── Middleware ────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

WSGI_APPLICATION = 'config.wsgi.application'

# ── Database — Neon (prod) ou SQLite (local) ──────────────────
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME':   BASE_DIR / 'db.sqlite3',
        }
    }

# ── Static Files — WhiteNoise ─────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.StaticFilesStorage'
WHITENOISE_MANIFEST_STRICT = False

# ── Media Files — Cloudinary (prod) ou local (dev) ───────────
CLOUDINARY_URL = config('CLOUDINARY_URL', default=None)

if CLOUDINARY_URL:
    # Production → Cloudinary
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api

    os.environ['CLOUDINARY_URL'] = CLOUDINARY_URL
    cloudinary.config(cloudinary_url=CLOUDINARY_URL)

    CLOUDINARY_STORAGE = {
        'CLOUDINARY_URL': CLOUDINARY_URL
    }

    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    
    # ترك MEDIA_URL نسبي لمنع مضاعفة الرابط مع Cloudinary Storage
    MEDIA_URL = '/media/'

else:
    # Local → fichiers locaux
    MEDIA_URL  = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ── Auth ──────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE     = 'Africa/Algiers'
USE_I18N = True
USE_TZ   = True

# ── DRF ──────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# ── JWT ───────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── CORS ──────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True