from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    
    class SubscriptionType(models.TextChoices):
        FREE = 'free', 'Free'
        PREMIUM = 'premium', 'Premium'
        PRO = 'pro', 'Pro'
    
    email = models.EmailField(unique=True)
    subscription_type = models.CharField(max_length=20,choices=SubscriptionType.choices,default=SubscriptionType.FREE,)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.email
    
    @property
    def is_premium(self):
        return self.subscription_type in [self.SubscriptionType.PREMIUM, self.SubscriptionType.PRO]


class UserBaseProfile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='base_profile')
    height_cm = models.PositiveIntegerField(null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    allergies = models.JSONField(default=list, blank=True)
    dietary_restrictions = models.JSONField(default=list, blank=True)
    fitness_goals = models.JSONField(default=list, blank=True)
    budget_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calorie_target = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} base profile"


class UserRewards(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='rewards')
    points = models.PositiveIntegerField(default=0)
    streak_count = models.PositiveIntegerField(default=0)
    last_cooked_date = models.DateField(null=True, blank=True)
    badges = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} rewards"


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    plan_type = models.CharField(max_length=20,choices=User.SubscriptionType.choices,default=User.SubscriptionType.FREE,)
    features = models.JSONField(default=list,help_text="List of features included in this plan")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} - ${self.price}"
