import { Star, CheckCircle, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useMealHistory } from '@/hooks/useMealHistory'
import { formatDateTime } from '@/lib/utils'

export function MealHistoryPage() {
  const { data, isLoading } = useMealHistory()
  const meals = data?.results ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meal History</h1>
      {!meals.length ? (
        <EmptyState
          icon={History}
          title="No meals logged yet"
          description="Cook a recipe and log your meal to start tracking your history."
        />
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Recipe</th>
                <th className="px-4 py-3 text-left font-medium">Cooked</th>
                <th className="px-4 py-3 text-left font-medium">Rating</th>
                <th className="px-4 py-3 text-left font-medium">Inventory only</th>
                <th className="px-4 py-3 text-left font-medium">Savings</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/recipes/${meal.recipe}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {meal.recipe_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(meal.cooked_at)}
                  </td>
                  <td className="px-4 py-3">
                    {meal.rating ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {meal.rating}/5
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {meal.used_inventory_only ? (
                      <Badge className="bg-green-100 text-green-800" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {meal.savings_estimate ? `$${meal.savings_estimate.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
