import { apiClient } from './client'
import type {
  InventoryItem,
  InventoryTag,
  InventoryHistory,
  CreateInventoryItemPayload,
  UpdateInventoryItemPayload,
  InventoryFilters,
  PaginatedResponse,
} from '@/types/inventory.types'

export const inventoryApi = {
  getItems: async (filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>> => {
    const params: Record<string, unknown> = {}
    if (filters?.perishable !== undefined) params.perishable = filters.perishable
    if (filters?.expired !== undefined) params.expired = filters.expired
    if (filters?.tags?.length) params.tags = filters.tags.join(',')
    if (filters?.page) params.page = filters.page
    const res = await apiClient.get('/inventory/', { params })
    return res.data
  },

  getItem: async (id: number): Promise<InventoryItem> => {
    const res = await apiClient.get(`/inventory/${id}/`)
    return res.data
  },

  createItem: async (data: CreateInventoryItemPayload): Promise<InventoryItem> => {
    const res = await apiClient.post('/inventory/', data)
    return res.data
  },

  updateItem: async (id: number, data: UpdateInventoryItemPayload): Promise<InventoryItem> => {
    const res = await apiClient.patch(`/inventory/${id}/`, data)
    return res.data
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/${id}/`)
  },

  undo: async (): Promise<{ message: string }> => {
    const res = await apiClient.post('/inventory/undo/')
    return res.data
  },

  getTags: async (): Promise<InventoryTag[]> => {
    const res = await apiClient.get('/inventory/tags/')
    return Array.isArray(res.data) ? res.data : (res.data.results ?? [])
  },

  getHistory: async (): Promise<InventoryHistory[]> => {
    const res = await apiClient.get('/inventory/history/')
    return res.data
  },
}
