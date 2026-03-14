import { RecipeCard } from './RecipeCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Recipe } from '@/types/recipe.types'

interface RecipeGridProps {
  recipes: Recipe[]
  isLoading?: boolean
  linkPrefix?: string
}

export function RecipeGrid({ recipes, isLoading, linkPrefix }: RecipeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} linkPrefix={linkPrefix} />
      ))}
    </div>
  )
}
