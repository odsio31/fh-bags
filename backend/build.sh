#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput

python manage.py migrate

python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='fateh').exists() or User.objects.create_superuser('fateh', 'fateh@gmail.com', 'fateh@123')"