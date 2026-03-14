import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi, type CommunityFilters } from '@/lib/api/community.api'
import { queryKeys } from '@/lib/queryKeys'
import type { ForkRecipePayload } from '@/types/recipe.types'

export function useCommunityRecipes(filters?: CommunityFilters) {
  return useQuery({
    queryKey: queryKeys.communityRecipes(filters as Record<string, unknown>),
    queryFn: () => communityApi.getRecipes(filters),
  })
}

export function useCommunityRecipe(id: number) {
  return useQuery({
    queryKey: queryKeys.communityRecipe(id),
    queryFn: () => communityApi.getRecipe(id),
    enabled: !!id,
  })
}

export function usePopularRecipes() {
  return useQuery({
    queryKey: queryKeys.popularRecipes(),
    queryFn: communityApi.getPopular,
  })
}

export function useForkCommunityRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ForkRecipePayload }) =>
      communityApi.forkRecipe(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myForks() })
      toast.success('Recipe forked to your collection')
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 400) {
        toast.error('Already forked', {
          description: 'You already have this recipe in your forks.',
        })
      } else {
        toast.error('Failed to fork recipe')
      }
    },
  })
}
