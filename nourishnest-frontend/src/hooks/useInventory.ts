import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { inventoryApi } from '@/lib/api/inventory.api'
import { queryKeys } from '@/lib/queryKeys'
import type { InventoryFilters, CreateInventoryItemPayload, UpdateInventoryItemPayload } from '@/types/inventory.types'

export function useInventoryItems(filters?: InventoryFilters) {
  return useQuery({
    queryKey: queryKeys.inventoryItems(filters),
    queryFn: () => inventoryApi.getItems(filters),
  })
}

export function useInventoryTags() {
  return useQuery({
    queryKey: queryKeys.inventoryTags(),
    queryFn: inventoryApi.getTags,
  })
}

export function useCreateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInventoryItemPayload) => inventoryApi.createItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.success('Item added to pantry')
    },
    onError: () => toast.error('Failed to add item'),
  })
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInventoryItemPayload }) =>
      inventoryApi.updateItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.success('Item updated')
    },
    onError: () => toast.error('Failed to update item'),
  })
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'items'] })
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.error('Failed to delete item')
    },
  })
}

export function useUndoInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.undo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'items'] })
      qc.invalidateQueries({ queryKey: queryKeys.inventoryHistory() })
      toast.success('Action undone')
    },
    onError: () => toast.error('Nothing to undo'),
  })
}
