from django.db.models.signals import post_save, m2m_changed
from django.db import transaction
from django.dispatch import receiver
from .models import VClass, Word
from django.contrib.auth.models import User

# @receiver(post_save, sender=Word)
# def assign_related_words(sender, instance, created, **kwargs):
#     pass