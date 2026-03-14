import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recipesApi } from '@/lib/api/recipes.api'
import { queryKeys } from '@/lib/queryKeys'
import type { LogMealPayload } from '@/types/recipe.types'

export function useMealHistory() {
  return useQuery({
    queryKey: queryKeys.mealHistory(),
    queryFn: recipesApi.getMealHistory,
  })
}

export function useLogMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LogMealPayload }) =>
      recipesApi.logMeal(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.mealHistory() })
      qc.invalidateQueries({ queryKey: queryKeys.userRewards() })
      const points = result.points_earned
      if (points) {
        toast.success(`Meal logged! +${points} points earned`)
      } else {
        toast.success('Meal logged!')
      }
    },
    onError: () =>
      toast.error('Failed to log meal. Backend error — the team has been notified.'),
  })
}
