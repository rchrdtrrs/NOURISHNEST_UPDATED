import { useState } from 'react'
import { CommunityFilters } from '@/components/community/CommunityFilters'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCommunityRecipes, usePopularRecipes } from '@/hooks/useCommunity'
import { Globe } from 'lucide-react'
import type { CommunityFilters as CommunityFiltersType } from '@/lib/api/community.api'

export function CommunityPage() {
  const [filters, setFilters] = useState<CommunityFiltersType>({ page: 1 })
  const { data, isLoading } = useCommunityRecipes(filters)
  const { data: popular } = usePopularRecipes()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Community Recipes</h1>

      {popular && popular.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Most Forked</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {popular.slice(0, 10).map((recipe) => (
              <div key={recipe.id} className="w-56 shrink-0">
                <RecipeGrid recipes={[recipe]} linkPrefix="/community" />
              </div>
            ))}
          </div>
        </div>
      )}

      <CommunityFilters filters={filters} onChange={setFilters} />

      {!isLoading && !data?.results.length ? (
        <EmptyState
          icon={Globe}
          title="No recipes found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <RecipeGrid recipes={data?.results ?? []} isLoading={isLoading} linkPrefix="/community" />
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
