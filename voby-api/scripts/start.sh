#!/bin/bash
echo "Creating superuser..."
python manage.py createsuperuser --noinput

echo "Starting Migrations..."
python manage.py migrate

echo ============================================
echo "Starting Server..."
gunicorn -c gunicorn.conf.py