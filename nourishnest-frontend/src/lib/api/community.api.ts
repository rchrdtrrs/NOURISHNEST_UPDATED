import { publicClient, apiClient } from './client'
import type { Recipe, ForkRecipePayload, RecipeFork } from '@/types/recipe.types'
import type { PaginatedResponse } from '@/types/inventory.types'

export interface CommunityFilters {
  search?: string
  difficulty?: string
  tags?: number[]
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}

export const communityApi = {
  getRecipes: async (filters?: CommunityFilters): Promise<PaginatedResponse<Recipe>> => {
    const params: Record<string, unknown> = {}
    if (filters?.search) params.search = filters.search
    if (filters?.difficulty) params.difficulty = filters.difficulty
    if (filters?.tags?.length) params.tags = filters.tags.join(',')
    if (filters?.sort) params.sort = filters.sort
    if (filters?.direction) params.direction = filters.direction
    if (filters?.page) params.page = filters.page
    const res = await publicClient.get('/community/recipes/', { params })
    return res.data
  },

  getRecipe: async (id: number): Promise<Recipe> => {
    const res = await publicClient.get(`/community/recipes/${id}/`)
    return res.data
  },

  getPopular: async (): Promise<Recipe[]> => {
    const res = await publicClient.get('/community/recipes/popular/')
    return res.data
  },

  forkRecipe: async (id: number, data?: ForkRecipePayload): Promise<RecipeFork> => {
    const res = await apiClient.post(`/community/recipes/${id}/fork/`, data ?? {})
    return res.data
  },
}
