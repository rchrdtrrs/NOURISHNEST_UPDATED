from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import SubscriptionPlan, UserBaseProfile, UserRewards
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    UserBaseProfileSerializer,
    SubscriptionPlanSerializer,
    UpgradeSubscriptionSerializer,
    UserRewardsSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        UserBaseProfile.objects.get_or_create(user=user)
        UserRewards.objects.get_or_create(user=user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'},status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({'message': 'Successfully logged out'},status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid or expired refresh token'},status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UserProfileUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user


class SubscriptionPlanListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.filter(is_active=True)


class UpgradeSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = UpgradeSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_id = serializer.validated_data['plan_id']
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Invalid or inactive subscription plan'},status=status.HTTP_404_NOT_FOUND,)

        new_type = plan.plan_type

        request.user.subscription_type = new_type
        request.user.save(update_fields=['subscription_type'])

        return Response({'message': f'Successfully upgraded to {plan.name}','subscription_type': request.user.subscription_type,'user': UserSerializer(request.user).data,})


class UserBaseProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserBaseProfileSerializer

    def get_object(self):
        profile, _ = UserBaseProfile.objects.get_or_create(user=self.request.user)
        return profile


class UserRewardsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserRewardsSerializer

    def get_object(self):
        rewards, _ = UserRewards.objects.get_or_create(user=self.request.user)
        return rewards
