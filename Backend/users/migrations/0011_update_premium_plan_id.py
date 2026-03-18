from django.db import migrations


NEW_PREMIUM_PLAN_ID = 'P-1JE35246EX4260641NG5JSVI'
OLD_PREMIUM_PLAN_ID = 'P-5B864563Y8096171GNG5IIQA'


def set_new_premium_plan_id(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type='premium').update(paypal_plan_id=NEW_PREMIUM_PLAN_ID)


def revert_premium_plan_id(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type='premium').update(paypal_plan_id=OLD_PREMIUM_PLAN_ID)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_set_paypal_plan_ids'),
    ]

    operations = [
        migrations.RunPython(set_new_premium_plan_id, reverse_code=revert_premium_plan_id),
    ]
