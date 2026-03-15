# Generated migration for UserBaseProfile and UserRewards reward system updates

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_seed_subscription_plans'),
        ('recipes', '0008_recipereview'),
    ]

    operations = [
        # Add new fields to UserBaseProfile
        migrations.AddField(
            model_name='userbaseprofile',
            name='has_advanced_analytics',
            field=models.BooleanField(default=False, help_text='Unlocked via points redemption'),
        ),
        migrations.AddField(
            model_name='userbaseprofile',
            name='has_ai_substitutions',
            field=models.BooleanField(default=False, help_text='Unlocked via points redemption'),
        ),
        migrations.AddField(
            model_name='userbaseprofile',
            name='theme_slugs',
            field=models.JSONField(blank=True, default=list, help_text='List of unlocked themes'),
        ),
        # Add ManyToMany field to UserRewards
        migrations.AddField(
            model_name='userrewards',
            name='chef_curated_recipes',
            field=models.ManyToManyField(
                blank=True,
                help_text='Chef-curated recipes unlocked by user',
                related_name='unlocked_by_users',
                to='recipes.recipe',
            ),
        ),
    ]
