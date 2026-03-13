import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0004_remove_recipe_ingredients'),
        ('users', '0005_remove_recipegenerationusage_state'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],  # table already exists as users_recipegenerationusage
            state_operations=[
                migrations.CreateModel(
                    name='RecipeGenerationUsage',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('date', models.DateField()),
                        ('count', models.PositiveIntegerField(default=0)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('user', models.ForeignKey(
                            on_delete=django.db.models.deletion.CASCADE,
                            related_name='generation_usage',
                            to=settings.AUTH_USER_MODEL,
                        )),
                    ],
                    options={
                        'indexes': [models.Index(fields=['user', 'date'], name='users_recip_user_id_d61e8d_idx')],
                        'unique_together': {('user', 'date')},
                    },
                ),
            ],
        )
    ]
