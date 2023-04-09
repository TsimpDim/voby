from django.contrib import admin
from django.apps import apps

voby_models = apps.get_app_config('voby').get_models()
for model in voby_models:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass