import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RecipeFilters as RecipeFiltersType } from '@/types/recipe.types'

interface RecipeFiltersProps {
  filters: RecipeFiltersType
  onChange: (filters: RecipeFiltersType) => void
}

export function RecipeFilters({ filters, onChange }: RecipeFiltersProps) {
  const update = (partial: Partial<RecipeFiltersType>) =>
    onChange({ ...filters, ...partial, page: 1 })

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm">Difficulty</Label>
        <Select
          value={filters.difficulty ?? 'all'}
          onValueChange={(v) => update({ difficulty: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="ai-filter"
          checked={filters.is_ai_generated === true}
          onCheckedChange={(v) => update({ is_ai_generated: v ? true : undefined })}
        />
        <Label htmlFor="ai-filter" className="text-sm">AI generated only</Label>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm">Min match</Label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={filters.min_match_score ?? 0}
          onChange={(e) => update({ min_match_score: parseFloat(e.target.value) || undefined })}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">
          {Math.round((filters.min_match_score ?? 0) * 100)}%
        </span>
      </div>
    </div>
  )
}
