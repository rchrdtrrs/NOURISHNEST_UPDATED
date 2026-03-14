import { useState } from 'react'
import { Clock, ChefHat, Users, Utensils } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MatchScoreBadge } from './MatchScoreBadge'
import { NutritionBadge } from './NutritionBadge'
import { LogMealDialog } from './LogMealDialog'
import { ForkRecipeDialog } from './ForkRecipeDialog'
import { useTogglePublic } from '@/hooks/useRecipes'
import type { Recipe } from '@/types/recipe.types'

interface RecipeDetailPanelProps {
  recipe: Recipe
  showActions?: boolean
}

export function RecipeDetailPanel({ recipe, showActions = true }: RecipeDetailPanelProps) {
  const [logOpen, setLogOpen] = useState(false)
  const [forkOpen, setForkOpen] = useState(false)
  const togglePublicMutation = useTogglePublic()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-bold">{recipe.name}</h1>
          <MatchScoreBadge score={recipe.match_score} />
        </div>
        <p className="mt-2 text-muted-foreground">{recipe.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Prep: {recipe.prep_time} min
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Cook: {recipe.cook_time} min
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            <span className="capitalize">{recipe.difficulty}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
          {recipe.cuisine && (
            <span className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              {recipe.cuisine}
            </span>
          )}
        </div>
        {recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Ingredients */}
      <div>
        <h2 className="mb-3 text-xl font-semibold">Ingredients</h2>
        <ul className="space-y-1 text-sm">
          {recipe.ingredients_text.map((ing, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {ing}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Instructions */}
      <div>
        <h2 className="mb-3 text-xl font-semibold">Instructions</h2>
        <div className="space-y-3 text-sm">
          {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      {Object.keys(recipe.nutrition_info).length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-3 text-xl font-semibold">Nutrition</h2>
            <NutritionBadge nutritionInfo={recipe.nutrition_info} />
          </div>
        </>
      )}

      {/* Actions */}
      {showActions && (
        <>
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setLogOpen(true)}>Log meal</Button>
            <Button variant="outline" onClick={() => setForkOpen(true)}>
              Fork recipe
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="public-toggle"
                checked={recipe.is_public}
                onCheckedChange={(v) =>
                  togglePublicMutation.mutate({ id: recipe.id, isPublic: v })
                }
              />
              <Label htmlFor="public-toggle" className="text-sm">
                {recipe.is_public ? 'Public' : 'Private'}
              </Label>
            </div>
          </div>
        </>
      )}

      <LogMealDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        recipeId={recipe.id}
        recipeName={recipe.name}
      />
      <ForkRecipeDialog open={forkOpen} onOpenChange={setForkOpen} recipe={recipe} />
    </div>
  )
}
