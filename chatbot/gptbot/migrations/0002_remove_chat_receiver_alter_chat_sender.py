# Generated by Django 4.2.5 on 2023-09-30 19:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('gptbot', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chat',
            name='receiver',
        ),
        migrations.AlterField(
            model_name='chat',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chats', to=settings.AUTH_USER_MODEL),
        ),
    ]
