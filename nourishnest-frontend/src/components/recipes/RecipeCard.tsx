import { Link } from 'react-router-dom'
import { Clock, ChefHat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MatchScoreBadge } from './MatchScoreBadge'
import type { Recipe } from '@/types/recipe.types'

interface RecipeCardProps {
  recipe: Recipe
  linkPrefix?: string
}

export function RecipeCard({ recipe, linkPrefix = '/recipes' }: RecipeCardProps) {
  return (
    <Link to={`${linkPrefix}/${recipe.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base">{recipe.name}</CardTitle>
            <MatchScoreBadge score={recipe.match_score} className="shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recipe.total_time} min
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              <span className="capitalize">{recipe.difficulty}</span>
            </span>
          </div>
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
