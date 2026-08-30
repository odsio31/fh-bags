import os
import sys
from pathlib import Path

# 1. تحديد المسار الرئيسي للمشروع وإضافته إلى Python Path
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))
sys.path.insert(0, str(CURRENT_DIR.parent))

# 2. اكتشاف ملف settings.py وتعيينه تلقائياً
settings_found = False
for path in CURRENT_DIR.rglob("settings.py"):
    rel_path = path.relative_to(CURRENT_DIR)
    module_name = str(rel_path.with_suffix("")).replace(os.sep, ".")
    os.environ['DJANGO_SETTINGS_MODULE'] = module_name
    settings_found = True
    break

if not settings_found:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 3. تهيئة Django
import django
django.setup()

from django.contrib.auth import get_user_model

def create_or_update_superuser():
    User = get_user_model()

    # القيم الافتراضية للحساب (يمكن تعديلها أو قراءتها من بيئة Render)
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
            print(f"[SUCCESS] Superuser '{USERNAME}' password and permissions updated successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to set up superuser: {e}")

if __name__ == '__main__':
    create_or_update_superuser()