import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeDetailPanel } from '@/components/recipes/RecipeDetailPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCommunityRecipe, useForkCommunityRecipe } from '@/hooks/useCommunity'

export function CommunityRecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: recipe, isLoading, error } = useCommunityRecipe(Number(id))
  const forkMutation = useForkCommunityRecipe()

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
          <Link to="/community">Back to community</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/community">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to community
        </Link>
      </Button>

      <RecipeDetailPanel recipe={recipe} showActions={false} />

      <div className="mt-6 pt-6 border-t flex items-center gap-2">
        <Button
          onClick={() => forkMutation.mutate({ id: recipe.id })}
          disabled={forkMutation.isPending}
        >
          {forkMutation.isPending ? 'Forking...' : 'Fork to my collection'}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/recipes/my-forks">View my forks</Link>
        </Button>
      </div>
    </div>
  )
}
