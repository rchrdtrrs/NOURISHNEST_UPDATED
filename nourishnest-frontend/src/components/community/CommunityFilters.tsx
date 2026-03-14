import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CommunityFilters as CommunityFiltersType } from '@/lib/api/community.api'

interface CommunityFiltersProps {
  filters: CommunityFiltersType
  onChange: (filters: CommunityFiltersType) => void
}

export function CommunityFilters({ filters, onChange }: CommunityFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      onChange({ ...filters, search: searchInput || undefined, page: 1 })
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (partial: Partial<CommunityFiltersType>) =>
    onChange({ ...filters, ...partial, page: 1 })

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Search recipes..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm shrink-0">Difficulty</Label>
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
        <Label className="text-sm shrink-0">Sort by</Label>
        <Select
          value={filters.sort ?? 'created_at'}
          onValueChange={(v) => update({ sort: v })}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Newest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="match_score">Match score</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.direction ?? 'desc'}
          onValueChange={(v) => update({ direction: v as 'asc' | 'desc' })}
        >
          <SelectTrigger className="h-8 w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
