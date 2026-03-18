from django.db import migrations


PREMIUM_PLAN_ID = 'P-5B864563Y8096171GNG5IIQA'
PRO_PLAN_ID = 'P-7RW65567662052405NG5IJAI'


def set_paypal_plan_ids(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type='premium').update(paypal_plan_id=PREMIUM_PLAN_ID)
    SubscriptionPlan.objects.filter(plan_type='pro').update(paypal_plan_id=PRO_PLAN_ID)


def unset_paypal_plan_ids(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type__in=['premium', 'pro']).update(paypal_plan_id='')


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_reward_system_unlock'),
    ]

    operations = [
        migrations.RunPython(set_paypal_plan_ids, reverse_code=unset_paypal_plan_ids),
    ]
