from django.db import models
from django.contrib.auth.models import User

class VClass(models.Model):
    
    LANGUAGE_CHOICES = (
        ('English', '🇬🇧'),
        ('French', '🇫🇷'),
        ('Spanish', '🇪🇸'),
        ('German', '🇩🇪'),
        ('Italian', '🇮🇹'),
        ('Japanese', '🇯🇵'),
        ('Korean', '🇰🇷'),
        ('Mandarin Chinese', '🇨🇳'),
        ('Russian', '🇷🇺'),
        ('Hindi', '🇮🇳'),
        ('Portuguese', '🇧🇷'),
        ('Arabic', '🇸🇦'),
        ('Dutch', '🇳🇱'),
        ('Swedish', '🇸🇪'),
        ('Norwegian', '🇳🇴'),
        ('Danish', '🇩🇰'),
        ('Finnish', '🇫🇮'),
        ('Turkish', '🇹🇷'),
        ('Polish', '🇵🇱'),
        ('Czech', '🇨🇿'),
        ('Greek', '🇬🇷'),
        ('Hungarian', '🇭🇺'),
        ('Romanian', '🇷🇴'),
        ('Bulgarian', '🇧🇬'),
        ('Croatian', '🇭🇷'),
        ('Serbian', '🇷🇸'),
        ('Slovak', '🇸🇰'),
        ('Slovenian', '🇸🇮'),
        ('Estonian', '🇪🇪'),
        ('Latvian', '🇱🇻'),
        ('Lithuanian', '🇱🇹'),
        ('Ukrainian', '🇺🇦'),
        ('Hebrew', '🇮🇱'),
        ('Thai', '🇹🇭'),
        ('Vietnamese', '🇻🇳'),
        ('Indonesian', '🇮🇩'),
        ('Malay', '🇲🇾'),
        ('Tagalog', '🇵🇭'),
        ('Bengali', '🇧🇩'),
        ('Punjabi', '🇮🇳'),
        ('Tamil', '🇮🇳'),
        ('Telugu', '🇮🇳'),
        ('Marathi', '🇮🇳'),
        ('Gujarati', '🇮🇳'),
        ('Urdu', '🇵🇰'),
        ('Farsi', '🇮🇷'),
        ('Kurdish', '🇮🇶'),
        ('Swahili', '🇹🇿'),
        ('Zulu', '🇿🇦'),
        ('Afrikaans', '🇿🇦'),
        ('Xhosa', '🇿🇦'),
        ('Yoruba', '🇳🇬'),
        ('Igbo', '🇳🇬'),
        ('Hausa', '🇳🇬'),
        ('Amharic', '🇪🇹'),
    )

    name = models.CharField(max_length=25, null=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    source_language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, null=False)
    target_language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, null=False)
    
    def __str__(self):
        return f"{self.user}.{self.name}"

class Set(models.Model):
    name = models.CharField(max_length=25, null=False)
    vclass = models.ForeignKey(VClass, on_delete=models.CASCADE, null=False, related_name='sets')
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

class Word(models.Model):
    word = models.CharField(max_length=120, null=False)
    plural = models.CharField(max_length=120, null=True)
    favorite = models.BooleanField(default=False)
    general = models.TextField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    related_words = models.ManyToManyField('Word', blank=True, related_name='rel_words')
    sets = models.ManyToManyField(Set, related_name='words')
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

class Translation(models.Model):
    value = models.CharField(max_length=120, null=False)
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='translations')

class QuizAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    answered_at = models.DateTimeField(auto_now_add=True)
    correct = models.BooleanField(default=False)

class TestAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    took_at = models.DateTimeField(auto_now_add=True)
    questions_correct = models.IntegerField(default=0)

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    experience = models.PositiveIntegerField(default=0)

class Option(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    key = models.TextField(null=False, blank=False)
    value = models.TextField(null=False, blank=False)

class UserShortcuts(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    key_1 = models.CharField(max_length=10)
    key_2 = models.CharField(max_length=10)
    result = models.CharField(max_length=10)

class Example(models.Model):
    word = models.ManyToManyField(Word, related_name='examples')
    text = models.TextField(null=False, blank=False)
    translation = models.TextField(null=False, blank=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

class Tag(models.Model):
    word = models.ManyToManyField(Word, related_name='tags')
    value = models.TextField(null=False, blank=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)