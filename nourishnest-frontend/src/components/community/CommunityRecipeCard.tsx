import { RecipeCard } from '@/components/recipes/RecipeCard'
import type { Recipe } from '@/types/recipe.types'

interface CommunityRecipeCardProps {
  recipe: Recipe
}

export function CommunityRecipeCard({ recipe }: CommunityRecipeCardProps) {
  return <RecipeCard recipe={recipe} linkPrefix="/community" />
}
