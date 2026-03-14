export interface DailyNutrition {
  date: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface NutritionAnalytics {
  daily_breakdown: DailyNutrition[]
  total_calories: number
  avg_protein: number
  avg_carbs: number
  avg_fat: number
}

export interface InventoryAnalytics {
  total_items: number
  perishable_items: number
  expired_items: number
  expiring_within_week: number
  tag_distribution: Record<string, number>
  expiring_items: Array<{
    id: number
    name: string
    expiry_date: string
    days_until_expiry: number
  }>
}
