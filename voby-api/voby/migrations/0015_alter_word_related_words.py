# Generated by Django 4.0.4 on 2023-04-09 20:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('voby', '0014_alter_word_related_words'),
    ]

    operations = [
        migrations.AlterField(
            model_name='word',
            name='related_words',
            field=models.ManyToManyField(blank=True, related_name='rel_words', to='voby.word'),
        ),
    ]
