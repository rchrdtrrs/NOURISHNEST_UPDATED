from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_remove_recipegenerationusage_state'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptionplan',
            name='plan_type',
            field=models.CharField(
                choices=[('free', 'Free'), ('premium', 'Premium'), ('pro', 'Pro')],
                default='free',
                max_length=20,
            ),
        ),
    ]
