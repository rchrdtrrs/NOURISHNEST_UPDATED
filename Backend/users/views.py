import json
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.dateparse import parse_datetime
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SubscriptionPlan, UserBaseProfile, UserRewards, UserPayPalSubscription, PaymentTransaction
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    UserBaseProfileSerializer,
    SubscriptionPlanSerializer,
    UpgradeSubscriptionSerializer,
    UserRewardsSerializer,
    UserPayPalSubscriptionSerializer,
    ConfirmSubscriptionSerializer,
    CancelSubscriptionSerializer,
    PaymentTransactionSerializer,
)
from . import paypal_service

logger = logging.getLogger(__name__)

User = get_user_model()


def _set_refresh_cookie(response, refresh_token: str) -> None:
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax',
        max_age=7 * 24 * 60 * 60,
    )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']
        response = Response({'access': str(access)})
        _set_refresh_cookie(response, str(refresh))
        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({'access': str(serializer.validated_data['access'])})
        if 'refresh' in serializer.validated_data:
            _set_refresh_cookie(response, str(serializer.validated_data['refresh']))
        return response


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
        response = Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
        _set_refresh_cookie(response, str(refresh))
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        response = Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass
        return response


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


class InitiatePayPalSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'plan_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Invalid or inactive subscription plan'}, status=status.HTTP_404_NOT_FOUND)

        if not plan.paypal_plan_id:
            return Response({'error': 'This plan is not configured for PayPal billing'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'paypal_plan_id': plan.paypal_plan_id,
            'subscription_type': plan.plan_type,
        })


class ConfirmPayPalSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConfirmSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        subscription_id = serializer.validated_data['subscription_id']
        plan_id = serializer.validated_data['plan_id']

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Invalid or inactive subscription plan'}, status=status.HTTP_404_NOT_FOUND)

        try:
            details = paypal_service.get_subscription_details(subscription_id)
        except Exception as e:
            logger.error("PayPal subscription details fetch failed: %s", e)
            return Response({'error': 'Failed to verify subscription with PayPal'}, status=status.HTTP_502_BAD_GATEWAY)

        paypal_status = details.get('status', '')
        if paypal_status not in ('ACTIVE', 'APPROVED'):
            return Response(
                {'error': f'Subscription is not active. PayPal status: {paypal_status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_time = parse_datetime(details.get('start_time', '') or '')
        billing_info = details.get('billing_info', {})
        next_billing_time = parse_datetime(billing_info.get('next_billing_time', '') or '')

        UserPayPalSubscription.objects.update_or_create(
            user=request.user,
            defaults={
                'paypal_subscription_id': subscription_id,
                'paypal_plan_id': plan.paypal_plan_id,
                'status': paypal_status,
                'start_time': start_time,
                'next_billing_time': next_billing_time,
            },
        )

        request.user.subscription_type = plan.plan_type
        request.user.save(update_fields=['subscription_type'])

        return Response({
            'message': f'Subscription activated to {plan.name}',
            'user': UserSerializer(request.user).data,
        })


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CancelSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            paypal_sub = request.user.paypal_subscription
        except UserPayPalSubscription.DoesNotExist:
            return Response({'error': 'No active PayPal subscription found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            paypal_service.cancel_subscription(
                paypal_sub.paypal_subscription_id,
                reason=serializer.validated_data.get('reason', 'User requested cancellation'),
            )
        except Exception as e:
            logger.error("PayPal cancellation failed: %s", e)
            return Response({'error': 'Failed to cancel subscription with PayPal'}, status=status.HTTP_502_BAD_GATEWAY)

        paypal_sub.status = UserPayPalSubscription.Status.CANCELLED
        paypal_sub.save(update_fields=['status', 'updated_at'])

        request.user.subscription_type = 'free'
        request.user.save(update_fields=['subscription_type'])

        return Response({
            'message': 'Subscription cancelled successfully',
            'user': UserSerializer(request.user).data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        body = request.body

        if not paypal_service.verify_webhook_signature(request.headers, body):
            logger.warning("PayPal webhook signature verification failed")
            return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = json.loads(body)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get('event_type', '')
        resource = event.get('resource', {})

        self._handle_event(event_type, resource)

        return Response({'status': 'ok'})

    def _handle_event(self, event_type: str, resource: dict):
        subscription_id = resource.get('id') or resource.get('billing_agreement_id', '')

        if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            try:
                sub = UserPayPalSubscription.objects.get(paypal_subscription_id=subscription_id)
                sub.status = UserPayPalSubscription.Status.ACTIVE
                sub.start_time = parse_datetime(resource.get('start_time', '') or '')
                billing_info = resource.get('billing_info', {})
                sub.next_billing_time = parse_datetime(billing_info.get('next_billing_time', '') or '')
                sub.save()
            except UserPayPalSubscription.DoesNotExist:
                logger.warning("Webhook ACTIVATED: subscription %s not found", subscription_id)

        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            try:
                sub = UserPayPalSubscription.objects.get(paypal_subscription_id=subscription_id)
                sub.status = UserPayPalSubscription.Status.CANCELLED
                sub.save(update_fields=['status', 'updated_at'])
                sub.user.subscription_type = 'free'
                sub.user.save(update_fields=['subscription_type'])
            except UserPayPalSubscription.DoesNotExist:
                logger.warning("Webhook CANCELLED: subscription %s not found", subscription_id)

        elif event_type == 'BILLING.SUBSCRIPTION.SUSPENDED':
            try:
                sub = UserPayPalSubscription.objects.get(paypal_subscription_id=subscription_id)
                sub.status = UserPayPalSubscription.Status.SUSPENDED
                sub.save(update_fields=['status', 'updated_at'])
            except UserPayPalSubscription.DoesNotExist:
                logger.warning("Webhook SUSPENDED: subscription %s not found", subscription_id)

        elif event_type == 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
            try:
                sub = UserPayPalSubscription.objects.get(paypal_subscription_id=subscription_id)
                sub.status = UserPayPalSubscription.Status.SUSPENDED
                sub.save(update_fields=['status', 'updated_at'])
            except UserPayPalSubscription.DoesNotExist:
                logger.warning("Webhook PAYMENT.FAILED: subscription %s not found", subscription_id)

        elif event_type == 'PAYMENT.SALE.COMPLETED':
            billing_agreement_id = resource.get('billing_agreement_id', '')
            transaction_id = resource.get('id', '')
            amount_obj = resource.get('amount', {})
            amount = amount_obj.get('total', '0')
            currency = amount_obj.get('currency', 'USD')

            try:
                sub = UserPayPalSubscription.objects.get(paypal_subscription_id=billing_agreement_id)
                PaymentTransaction.objects.get_or_create(
                    paypal_transaction_id=transaction_id,
                    defaults={
                        'user': sub.user,
                        'paypal_subscription_id': billing_agreement_id,
                        'amount': amount,
                        'currency': currency,
                        'status': 'COMPLETED',
                    },
                )
            except UserPayPalSubscription.DoesNotExist:
                logger.warning("Webhook PAYMENT.SALE.COMPLETED: subscription %s not found", billing_agreement_id)
        else:
            logger.info("Unhandled PayPal webhook event: %s", event_type)


class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            paypal_sub = request.user.paypal_subscription
            sub_data = UserPayPalSubscriptionSerializer(paypal_sub).data
        except UserPayPalSubscription.DoesNotExist:
            sub_data = {
                'status': None,
                'start_time': None,
                'next_billing_time': None,
                'paypal_subscription_id': None,
            }

        return Response({
            **sub_data,
            'subscription_type': request.user.subscription_type,
        })


class TransactionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentTransactionSerializer

    def get_queryset(self):
        return PaymentTransaction.objects.filter(user=self.request.user)
