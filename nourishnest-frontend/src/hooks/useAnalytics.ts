import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics.api'
import { queryKeys } from '@/lib/queryKeys'

export function useNutritionAnalytics(days: number) {
  return useQuery({
    queryKey: queryKeys.nutritionAnalytics(days),
    queryFn: () => analyticsApi.getNutrition(days),
  })
}

export function useInventoryAnalytics() {
  return useQuery({
    queryKey: queryKeys.inventoryAnalytics(),
    queryFn: analyticsApi.getInventory,
  })
}
