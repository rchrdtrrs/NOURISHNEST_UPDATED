from datetime import timedelta
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import InventoryItem
from recipes.models import Recipe
from users.permissions import IsPremiumUser

MAX_ANALYTICS_DAYS = 30
DEFAULT_ANALYTICS_DAYS = 7
EXPIRING_SOON_LIMIT = 10
TAG_DISTRIBUTION_LIMIT = 10


class NutritionAnalyticsView(APIView):

    permission_classes = [IsAuthenticated, IsPremiumUser]

    def get(self, request):
        days = self._parse_days(request)
        start_date = timezone.now() - timedelta(days=days)
        recipes = Recipe.objects.filter(created_by=request.user, created_at__gte=start_date).exclude(nutrition_info={},).exclude(nutrition_info__isnull=True,)
        recipe_count = recipes.count()

        total_nutrition = {'calories': 0,'protein_g': 0,'carbs_g': 0,'fat_g': 0,'fiber_g': 0,}
        daily_breakdown = {}

        for recipe in recipes.only('nutrition_info', 'created_at'):
            nutrition = recipe.nutrition_info or {}
            if not nutrition:
                continue

            for key in total_nutrition:
                total_nutrition[key] += nutrition.get(key, 0) or 0

            date_str = recipe.created_at.date().isoformat()
            if date_str not in daily_breakdown:
                daily_breakdown[date_str] = {'calories': 0,'protein_g': 0,'carbs_g': 0,'fat_g': 0,'fiber_g': 0,'recipe_count': 0,}

            day = daily_breakdown[date_str]
            for key in total_nutrition:
                day[key] += nutrition.get(key, 0) or 0
            day['recipe_count'] += 1

        avg_nutrition = {}
        if recipe_count > 0:
            avg_nutrition = {
                key: round(value / recipe_count, 1)
                for key, value in total_nutrition.items()
            }

        return Response({'period_days': days,'recipe_count': recipe_count,'total_nutrition': total_nutrition,'average_per_recipe': avg_nutrition,'daily_breakdown': daily_breakdown,})

    @staticmethod
    def _parse_days(request) -> int:
        try:
            days = int(request.query_params.get('days', DEFAULT_ANALYTICS_DAYS))
        except (ValueError, TypeError):
            days = DEFAULT_ANALYTICS_DAYS
        return max(1, min(days, MAX_ANALYTICS_DAYS))


class InventoryAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsPremiumUser]

    def get(self, request):
        today = timezone.now().date()
        week_ahead = today + timedelta(days=7)

        items = InventoryItem.objects.filter(user=request.user)

        total_items = items.count()
        perishable_items = items.filter(perishable=True).count()
        expired_items = items.filter(expiry_date__lt=today).count()
        expiring_soon = items.filter(expiry_date__gte=today,expiry_date__lte=week_ahead,).count()

        expiring_list = items.filter(expiry_date__gte=today,expiry_date__lte=week_ahead,).values('id', 'name', 'quantity', 'expiry_date')[:EXPIRING_SOON_LIMIT]

        tag_stats = (items.values('tags__name').annotate(count=Count('id')).filter(tags__name__isnull=False).order_by('-count')[:TAG_DISTRIBUTION_LIMIT])

        return Response({'total_items': total_items,'perishable_items': perishable_items,'expired_items': expired_items,'expiring_within_week': expiring_soon,'expiring_items': list(expiring_list),'tag_distribution': list(tag_stats),})
