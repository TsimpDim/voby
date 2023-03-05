from django.db import models
from django.contrib.auth.models import User

class VClass(models.Model):
    name = models.CharField(max_length=120, null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user}.{self.name}"

class Set(models.Model):
    name = models.CharField(max_length=120, null=False)
    sourceLanguage = models.CharField(max_length=40, null=False)
    targetLanguage = models.CharField(max_length=40, null=False)
    vclass = models.ForeignKey(VClass, on_delete=models.DO_NOTHING, null=False)

class Word(models.Model):
    word = models.CharField(max_length=120, null=False)
    translation = models.CharField(max_length=120, null=False)
    general = models.TextField(null=True, blank=True)
    set = models.ForeignKey(Set, on_delete=models.DO_NOTHING, null=False)

class Example(models.Model):
    word = models.ManyToManyField(Word)
    text = models.TextField(null=False, blank=False)
    translation = models.TextField(null=False, blank=False)
