# Generated by Django 4.0.4 on 2023-03-05 19:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Set',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('sourceLanguage', models.CharField(max_length=40)),
                ('targetLanguage', models.CharField(max_length=40)),
            ],
        ),
        migrations.CreateModel(
            name='Word',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('word', models.CharField(max_length=120)),
                ('translation', models.CharField(max_length=120)),
                ('general', models.TextField(blank=True, null=True)),
                ('set', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='voby.set')),
            ],
        ),
        migrations.CreateModel(
            name='VClass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='set',
            name='vclass',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='voby.vclass'),
        ),
        migrations.CreateModel(
            name='Example',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('translation', models.TextField()),
                ('word', models.ManyToManyField(to='voby.word')),
            ],
        ),
    ]
