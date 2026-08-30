#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# مسح مجلد staticfiles القديم وإعادة جمعه بنظافة
rm -rf staticfiles
python manage.py collectstatic --no-input --clear
python manage.py migrate
python create_admin.py