from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Profile, TestAnswer, Word
from django.contrib.auth.models import User

@receiver(post_save, sender=User)
def save_profile(sender, instance, created, **kwargs):
    if created:
        profile = Profile(user=instance)
        profile.save()

@receiver(post_save, sender=TestAnswer)
def save_profile(sender, instance, created, **kwargs):
    if created:
        profile = Profile.objects.get(user=instance.user)
        if instance.correct:
            profile.experience += 4
        else:
            profile.experience += 1
        profile.save()

@receiver(post_save, sender=Word)
def save_profile(sender, instance, created, **kwargs):
    if created:
        profile = Profile.objects.get(user=instance.user)
        profile.experience += 2
        profile.save()