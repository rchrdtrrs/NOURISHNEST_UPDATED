from .models import InventoryItem, UserHistory
from .serializers import InventoryItemSerializer


def record_inventory_history(user, action_type, item=None, old_data=None, object_id=None):
    UserHistory.objects.create(
        user=user,
        action_type=action_type,
        model_affected='InventoryItem',
        object_id=item.id if item else object_id,
        metadata={'old_data': old_data or {},'action': action_type,}
    )


def apply_undo(last_action, user):
    old_data = last_action.metadata.get('old_data', {})

    if last_action.action_type == 'add':
        item = InventoryItem.objects.get(id=last_action.object_id)
        item.delete()
        return {'message': f'Deleted item: {item.name}'}

    elif last_action.action_type == 'delete':
        tag_ids = old_data.pop('tag_ids', [])
        old_data.pop('id', None)
        old_data.pop('is_expired', None)
        old_data.pop('created_at', None)
        old_data.pop('updated_at', None)
        old_data.pop('tags', None)
        old_data['user'] = user

        item = InventoryItem.objects.create(**old_data)
        if tag_ids:
            item.tags.set(tag_ids)
        return {'message': f'Restored item: {item.name}','item': InventoryItemSerializer(item).data,}

    elif last_action.action_type == 'update':
        item = InventoryItem.objects.get(id=last_action.object_id)
        tag_ids = old_data.pop('tag_ids', None)

        for field in ['name', 'quantity', 'perishable', 'expiry_date', 'notes']:
            if field in old_data:
                setattr(item, field, old_data[field])

        item.save()
        if tag_ids:
            item.tags.set(tag_ids)
        return {'message': f'Restored item to previous state: {item.name}','item': InventoryItemSerializer(item).data,}

    else:
        raise ValueError(f'Unknown action type: {last_action.action_type}')
