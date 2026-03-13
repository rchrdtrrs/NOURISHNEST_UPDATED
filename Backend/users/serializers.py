from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import SubscriptionPlan, UserBaseProfile, UserRewards

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,required=True,validators=[validate_password],style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True,required=True,style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {'first_name': {'required': False},'last_name': {'required': False},}
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': "Passwords don't match."})  
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'subscription_type', 'is_premium',
            'date_joined', 'last_login'
        ]
        read_only_fields = [
            'id', 'email', 'subscription_type', 'is_premium',
            'date_joined', 'last_login'
        ]


class UserBaseProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBaseProfile
        fields = [
            'height_cm', 'weight_kg', 'allergies', 'dietary_restrictions',
            'fitness_goals', 'budget_limit', 'calorie_target',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_allergies(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("allergies must be a list")
        return value

    def validate_dietary_restrictions(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("dietary_restrictions must be a list")
        return value

    def validate_fitness_goals(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("fitness_goals must be a list")
        return value


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'plan_type', 'features', 'price', 'description', 'is_active']
        read_only_fields = ['id', 'is_active']


class UpgradeSubscriptionSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True)
    
    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan")
        return value


class UserRewardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRewards
        fields = ['points', 'streak_count', 'last_cooked_date', 'badges', 'updated_at']
        read_only_fields = ['updated_at']
