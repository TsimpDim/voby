from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VClass
from django.contrib.auth.models import User

# @receiver(post_save, sender=User)
# def create_default_resources(sender, instance, created, **kwargs):
#     if created:
#         pass