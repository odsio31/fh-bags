import os
import django

# إعداد بيئة Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# بيانات الحساب المراد إنشاؤه
USERNAME = os.getenv('ADMIN_USERNAME', 'fateh')
EMAIL = os.getenv('ADMIN_EMAIL', 'fateh@gmail.com')
PASSWORD = os.getenv('ADMIN_PASSWORD', 'fateh@123')

try:
    user, created = User.objects.get_or_create(username=USERNAME, defaults={'email': EMAIL})
    user.set_password(PASSWORD)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    
    if created:
        print(f"[SUCCESS] Superuser '{USERNAME}' created successfully.")
    else:
        print(f"[SUCCESS] Superuser '{USERNAME}' password and permissions updated.")
except Exception as e:
    print(f"[ERROR] Failed to setup superuser: {e}")