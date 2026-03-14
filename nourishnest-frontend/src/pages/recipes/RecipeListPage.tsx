import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { RecipeFilters } from '@/components/recipes/RecipeFilters'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { EmptyState } from '@/components/shared/EmptyState'
import { useRecipes } from '@/hooks/useRecipes'
import type { RecipeFilters as RecipeFiltersType } from '@/types/recipe.types'

export function RecipeListPage() {
  const [filters, setFilters] = useState<RecipeFiltersType>({ page: 1 })
  const { data, isLoading } = useRecipes(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Button asChild>
          <Link to="/recipes/generate">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Link>
        </Button>
      </div>

      <RecipeFilters filters={filters} onChange={setFilters} />

      {!isLoading && !data?.results.length ? (
        <EmptyState
          icon={BookOpen}
          title="No recipes yet"
          description="Generate your first AI-powered recipe from your pantry ingredients."
          action={
            <Button asChild>
              <Link to="/recipes/generate">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate recipe
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <RecipeGrid recipes={data?.results ?? []} isLoading={isLoading} />
          {data && (
            <PaginationControls
              count={data.count}
              next={data.next}
              previous={data.previous}
              currentPage={filters.page ?? 1}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </>
      )}
    </div>
  )
}
