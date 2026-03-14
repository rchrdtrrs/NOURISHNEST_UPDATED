import os
from django.core.management.base import BaseCommand
from users.models import SubscriptionPlan


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
        'paypal_plan_id_env': None,  # Free plan has no PayPal billing
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
        'paypal_plan_id_env': 'PAYPAL_PLAN_ID_PREMIUM',
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
        'paypal_plan_id_env': 'PAYPAL_PLAN_ID_PRO',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with default subscription plans'

    def handle(self, *args, **options):
        for plan_data in PLANS:
            paypal_plan_id = ''
            if plan_data['paypal_plan_id_env']:
                paypal_plan_id = os.environ.get(plan_data['paypal_plan_id_env'], '')

            plan, created = SubscriptionPlan.objects.get_or_create(
                plan_type=plan_data['plan_type'],
                defaults={
                    'name': plan_data['name'],
                    'price': plan_data['price'],
                    'description': plan_data['description'],
                    'features': plan_data['features'],
                    'paypal_plan_id': paypal_plan_id,
                    'is_active': True,
                },
            )

            if not created and paypal_plan_id and plan.paypal_plan_id != paypal_plan_id:
                plan.paypal_plan_id = paypal_plan_id
                plan.save(update_fields=['paypal_plan_id'])
                self.stdout.write(f'Updated PayPal plan ID: {plan.name}')
            else:
                status = 'Created' if created else 'Already exists'
                self.stdout.write(f'{status}: {plan.name} (${plan.price})')

        self.stdout.write(self.style.SUCCESS('Subscription plans seeded successfully.'))
