import { Link } from 'react-router-dom'
import { GitFork } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useMyForks } from '@/hooks/useRecipes'
import { formatDate } from '@/lib/utils'

export function MyForksPage() {
  const { data, isLoading } = useMyForks()
  const forks = data?.results ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Forks</h1>
      {!forks.length ? (
        <EmptyState
          icon={GitFork}
          title="No forks yet"
          description="Fork a recipe from the community or your recipe list to customize it."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forks.map((fork) => (
            <Link
              key={fork.id}
              to={`/recipes/my-forks/${fork.id}`}
              className="group"
            >
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-base">{fork.original_recipe_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{formatDate(fork.created_at)}</p>
                </CardHeader>
                {fork.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{fork.notes}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
