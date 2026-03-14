import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useInventoryTags } from '@/hooks/useInventory'
import type { InventoryTag } from '@/types/inventory.types'

interface TagSelectProps {
  value: number[]
  onChange: (ids: number[]) => void
}

export function TagSelect({ value, onChange }: TagSelectProps) {
  const { data: tags = [] } = useInventoryTags()
  const [open, setOpen] = useState(false)

  const toggle = (id: number) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const selectedTags = tags.filter((t: InventoryTag) => value.includes(t.id))
  const unselectedTags = tags.filter((t: InventoryTag) => !value.includes(t.id))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedTags.map((tag: InventoryTag) => (
          <Badge key={tag.id} variant="secondary" className="gap-1">
            {tag.name}
            <button type="button" onClick={() => toggle(tag.id)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(!open)}>
          + Add tag
        </Button>
      </div>
      {open && unselectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 rounded border p-2">
          {unselectedTags.map((tag: InventoryTag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => toggle(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
