# Generated by Django 4.0.4 on 2023-07-01 21:10

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('voby', '0019_testattempt'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserShortcuts',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key_1', models.CharField(max_length=10)),
                ('key_2', models.CharField(max_length=10)),
                ('result', models.CharField(max_length=10)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]