from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile, QuizAnswer, Option, Word, VClass, Set
from django.contrib.auth.models import User

@receiver(post_save, sender=VClass)
def save_profile(sender, instance, created, **kwargs):
    if created:
        set = Set(user=instance.user)
        set.vclass = instance
        set.name = "Default set"
        set.save()

@receiver(post_save, sender=User)
def save_profile(sender, instance, created, **kwargs):
    if created:
        profile = Profile(user=instance)
        profile.save()

        option = Option(user=instance, key="numTestQuestions", value="10")
        option.save()

@receiver(post_save, sender=QuizAnswer)
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