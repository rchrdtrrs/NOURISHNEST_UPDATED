import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recipesApi } from '@/lib/api/recipes.api'
import { queryKeys } from '@/lib/queryKeys'
import type { RecipeFilters, GenerateRecipePayload, ForkRecipePayload } from '@/types/recipe.types'

export function useRecipes(filters?: RecipeFilters) {
  return useQuery({
    queryKey: queryKeys.recipes(filters),
    queryFn: () => recipesApi.getRecipes(filters),
  })
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: queryKeys.recipe(id),
    queryFn: () => recipesApi.getRecipe(id),
    enabled: !!id,
  })
}

export function useGenerateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GenerateRecipePayload) => recipesApi.generateRecipe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes', 'list'] })
    },
    onError: () => toast.error('Failed to generate recipe'),
  })
}

export function useTogglePublic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean }) =>
      recipesApi.togglePublic(id, isPublic),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.recipe(id) })
      qc.invalidateQueries({ queryKey: ['recipes', 'list'] })
    },
  })
}

export function useForkRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ForkRecipePayload }) =>
      recipesApi.forkRecipe(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myForks() })
      toast.success('Recipe forked to your collection')
    },
    onError: () => toast.error('Failed to fork recipe'),
  })
}

export function useMyForks() {
  return useQuery({
    queryKey: queryKeys.myForks(),
    queryFn: recipesApi.getMyForks,
  })
}

export function useFork(id: number) {
  return useQuery({
    queryKey: queryKeys.fork(id),
    queryFn: () => recipesApi.getFork(id),
    enabled: !!id,
  })
}
