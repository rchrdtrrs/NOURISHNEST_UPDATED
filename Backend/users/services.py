from datetime import timedelta
from django.utils import timezone
from .models import UserRewards

POINTS_BASE_MEAL = 10
POINTS_BONUS_INVENTORY_ONLY = 0  
POINTS_MEAL_WITHOUT_INVENTORY = 5
POINTS_HIGH_RATING_BONUS = 5
HIGH_RATING_THRESHOLD = 4
POINTS_HIGH_SAVINGS_BONUS = 5
HIGH_SAVINGS_THRESHOLD = 20
STREAK_WASTE_WARRIOR = 7
POINTS_BUDGET_BOSS = 100
SAVINGS_BUDGET_BOSS = 50
STREAK_GREEN_CHEF = 3
PROTEIN_PRO_GRAMS = 25


def calculate_meal_points(*, used_inventory_only: bool, rating: int = None, savings_estimate=None) -> int:
    points = POINTS_BASE_MEAL if used_inventory_only else POINTS_MEAL_WITHOUT_INVENTORY

    if rating is not None and rating >= HIGH_RATING_THRESHOLD:
        points += POINTS_HIGH_RATING_BONUS

    if savings_estimate is not None and float(savings_estimate) >= HIGH_SAVINGS_THRESHOLD:
        points += POINTS_HIGH_SAVINGS_BONUS

    return points


def update_streak(rewards: UserRewards) -> None:
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)

    if rewards.last_cooked_date == yesterday:
        rewards.streak_count += 1
    elif rewards.last_cooked_date != today:
        rewards.streak_count = 1

    rewards.last_cooked_date = today


def evaluate_badges(rewards: UserRewards, *, recipe=None, used_inventory_only: bool = False) -> set:
    badges = set(rewards.badges or [])

    if rewards.streak_count >= STREAK_WASTE_WARRIOR:
        badges.add('Waste Warrior')

    if rewards.points >= POINTS_BUDGET_BOSS:
        badges.add('Budget Boss')

    if used_inventory_only and rewards.streak_count >= STREAK_GREEN_CHEF:
        badges.add('Green Chef')

    if recipe is not None:
        _check_protein_badge(badges, recipe)

    return badges


def _check_protein_badge(badges: set, recipe) -> None:
    protein_g = None
    if recipe.nutrition_info:
        protein_g = recipe.nutrition_info.get('protein_g')

    if protein_g and protein_g >= PROTEIN_PRO_GRAMS:
        badges.add('Protein Pro')

    if recipe.tags.filter(name__iexact='protein').exists():
        badges.add('Protein Pro')


def process_meal_rewards(user, recipe, *, used_inventory_only: bool, rating=None, savings_estimate=None) -> UserRewards:
    rewards, _ = UserRewards.objects.get_or_create(user=user)

    points = calculate_meal_points(used_inventory_only=used_inventory_only,rating=rating,savings_estimate=savings_estimate,)
    rewards.points += points

    update_streak(rewards)
    if savings_estimate is not None and float(savings_estimate) >= SAVINGS_BUDGET_BOSS:
        badges = set(rewards.badges or [])
        badges.add('Budget Boss')
        rewards.badges = sorted(badges)

    badges = evaluate_badges(rewards,recipe=recipe,used_inventory_only=used_inventory_only,)
    rewards.badges = sorted(badges)

    rewards.save(update_fields=['points', 'streak_count', 'last_cooked_date', 'badges', 'updated_at'])
    return rewards
