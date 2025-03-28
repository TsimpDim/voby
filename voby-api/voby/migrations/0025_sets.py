from django.db import migrations, models


def migrate_set_to_sets(apps, schema_editor):
    Word = apps.get_model("voby", "Word")

    for word in Word.objects.all():
        if word.set_id:  # Ensure there is data
            word.sets.add(word.set)  # Move the single value into the new M2M field


def migrate_sets_to_set(apps, schema_editor):
    Word = apps.get_model("voby", "Word")

    for word in Word.objects.all():
        sets = word.sets.all()
        if sets.exists():
            word.set = sets.first()  # Pick the first set as the original field was singular
            word.save()


class Migration(migrations.Migration):

    dependencies = [
        ('voby', '0024_tag'),
    ]

    operations = [
        migrations.AddField(
            model_name='word',
            name='sets',
            field=models.ManyToManyField(related_name='words', to='voby.set'),
        ),
        migrations.RunPython(migrate_set_to_sets, reverse_code=migrate_sets_to_set),
        migrations.RemoveField(
            model_name='word',
            name='set',
        ),
    ]
