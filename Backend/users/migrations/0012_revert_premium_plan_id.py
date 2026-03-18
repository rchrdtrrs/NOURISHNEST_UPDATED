from django.db import migrations


OLD_WORKING_PREMIUM_PLAN_ID = 'P-5B864563Y8096171GNG5IIQA'
NEW_PREMIUM_PLAN_ID = 'P-1JE35246EX4260641NG5JSVI'


def revert_to_old_premium_plan_id(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type='premium').update(paypal_plan_id=OLD_WORKING_PREMIUM_PLAN_ID)


def restore_new_premium_plan_id(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type='premium').update(paypal_plan_id=NEW_PREMIUM_PLAN_ID)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_update_premium_plan_id'),
    ]

    operations = [
        migrations.RunPython(revert_to_old_premium_plan_id, reverse_code=restore_new_premium_plan_id),
    ]
