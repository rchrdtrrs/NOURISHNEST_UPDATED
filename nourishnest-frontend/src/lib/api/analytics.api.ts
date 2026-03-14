import { apiClient } from './client'
import type { NutritionAnalytics, InventoryAnalytics } from '@/types/analytics.types'

export const analyticsApi = {
  getNutrition: async (days: number): Promise<NutritionAnalytics> => {
    const res = await apiClient.get('/analytics/nutrition/', { params: { days } })
    return res.data
  },

  getInventory: async (): Promise<InventoryAnalytics> => {
    const res = await apiClient.get('/analytics/inventory/')
    return res.data
  },
}
