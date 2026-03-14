import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeDetailPanel } from '@/components/recipes/RecipeDetailPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useRecipe } from '@/hooks/useRecipes'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: recipe, isLoading, error } = useRecipe(Number(id))

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/recipes">Back to recipes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/recipes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to recipes
        </Link>
      </Button>
      <RecipeDetailPanel recipe={recipe} showActions />
    </div>
  )
}
