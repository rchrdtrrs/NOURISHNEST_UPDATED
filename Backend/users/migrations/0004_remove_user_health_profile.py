from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_userbaseprofile_userrewards_recipegenerationusage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='health_profile',
        ),
    ]
