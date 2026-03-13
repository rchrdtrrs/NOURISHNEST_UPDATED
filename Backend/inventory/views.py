from django.db import transaction
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DietaryTag, InventoryItem, UserHistory
from .serializers import (DietaryTagSerializer,InventoryItemSerializer,InventoryItemCreateSerializer,UserHistorySerializer,)
from .services import record_inventory_history, apply_undo


class DietaryTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DietaryTag.objects.all()
    serializer_class = DietaryTagSerializer
    permission_classes = [IsAuthenticated]


class InventoryItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = InventoryItem.objects.filter(user=self.request.user)
        
        perishable = self.request.query_params.get('perishable')
        if perishable is not None:
            queryset = queryset.filter(perishable=perishable.lower() == 'true')
        
        tag_ids = self.request.query_params.getlist('tags')
        if tag_ids:
            queryset = queryset.filter(tags__id__in=tag_ids).distinct()
        
        expired = self.request.query_params.get('expired')
        if expired is not None:
            from django.utils import timezone
            today = timezone.now().date()
            if expired.lower() == 'true':
                queryset = queryset.filter(expiry_date__lt=today)
            else:
                queryset = queryset.filter(expiry_date__gte=today) | queryset.filter(expiry_date__isnull=True)
        
        return queryset.select_related('user').prefetch_related('tags')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InventoryItemCreateSerializer
        return InventoryItemSerializer
    
    def perform_create(self, serializer):
        item = serializer.save()
        record_inventory_history(self.request.user, 'add', item)

    def perform_update(self, serializer):
        old_data = InventoryItemSerializer(serializer.instance).data
        item = serializer.save()
        record_inventory_history(self.request.user, 'update', item, old_data=old_data)

    def perform_destroy(self, instance):
        old_data = InventoryItemSerializer(instance).data
        old_data['tag_ids'] = list(instance.tags.values_list('id', flat=True))
        item_id = instance.id
        instance.delete()
        record_inventory_history(self.request.user, 'delete', object_id=item_id, old_data=old_data)


class UndoView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        last_action = UserHistory.objects.filter(user=request.user,model_affected='InventoryItem',is_undone=False).exclude(action_type='undo').first()
        
        if not last_action:
            return Response({'error': 'No actions to undo'},status=status.HTTP_404_NOT_FOUND)
        
        try:
            result = apply_undo(last_action, request.user)
        except ValueError:
            return Response({'error': 'Unknown action type'},status=status.HTTP_400_BAD_REQUEST,)
        except InventoryItem.DoesNotExist:
            return Response({'error': 'Item no longer exists'},status=status.HTTP_404_NOT_FOUND,)

        last_action.is_undone = True
        last_action.save()

        UserHistory.objects.create(user=request.user,action_type='undo',model_affected='InventoryItem',object_id=last_action.object_id,metadata={'undone_action_id': last_action.id})

        return Response(result, status=status.HTTP_200_OK)


class UserHistoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserHistorySerializer
    
    def get_queryset(self):
        return UserHistory.objects.filter(user=self.request.user).order_by('-timestamp')
