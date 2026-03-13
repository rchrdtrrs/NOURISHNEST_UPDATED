from rest_framework.permissions import BasePermission


class IsPremiumUser(BasePermission):
    message = 'Premium subscription required.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_premium
