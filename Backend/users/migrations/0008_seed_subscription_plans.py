from django.db import migrations


PLANS = [
    {
        'name': 'Free',
        'plan_type': 'free',
        'price': '0.00',
        'description': 'Get started with basic meal management and pantry tracking.',
        'features': [
            '3 AI recipe generations per day',
            'Pantry tracking',
            'Basic recipes',
        ],
    },
    {
        'name': 'Premium',
        'plan_type': 'premium',
        'price': '9.99',
        'description': 'Unlock nutrition analytics and meal streaks for a healthier lifestyle.',
        'features': [
            '10 AI recipe generations per day',
            'All Free features',
            'Nutrition analytics',
            'Meal streaks',
        ],
    },
    {
        'name': 'Pro',
        'plan_type': 'pro',
        'price': '19.99',
        'description': 'The complete NourishNest experience with unlimited AI and priority support.',
        'features': [
            'Unlimited AI recipe generations',
            'All Premium features',
            'Priority support',
            'Advanced analytics',
        ],
    },
]


def seed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    for plan_data in PLANS:
        SubscriptionPlan.objects.get_or_create(
            plan_type=plan_data['plan_type'],
            defaults={
                'name': plan_data['name'],
                'price': plan_data['price'],
                'description': plan_data['description'],
                'features': plan_data['features'],
                'is_active': True,
            },
        )


def unseed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model('users', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(plan_type__in=['free', 'premium', 'pro']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_subscriptionplan_paypal_plan_id_paymenttransaction_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_plans, reverse_code=unseed_plans),
    ]
