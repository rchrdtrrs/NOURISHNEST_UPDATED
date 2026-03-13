from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0003_mealhistory'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recipe',
            name='ingredients',
        ),
    ]
