# Generated by Django 4.0.4 on 2023-10-22 10:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('voby', '0021_translation'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='word',
            name='translation',
        ),
    ]
