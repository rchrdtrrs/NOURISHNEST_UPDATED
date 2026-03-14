import { useState } from 'react'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { InventoryItemForm } from '@/components/inventory/InventoryItemForm'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  useInventoryItems,
  useInventoryTags,
  useCreateInventoryItem,
  useUpdateInventoryItem,
} from '@/hooks/useInventory'
import type { InventoryItem, InventoryFilters } from '@/types/inventory.types'

export function InventoryPage() {
  const [filters, setFilters] = useState<InventoryFilters>({ page: 1 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)

  const { data, isLoading } = useInventoryItems(filters)
  const { data: tags = [] } = useInventoryTags()
  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()

  const openAdd = () => {
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = (formData: Parameters<typeof createMutation.mutate>[0]) => {
    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, data: formData },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createMutation.mutate(formData, { onSuccess: () => setDialogOpen(false) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pantry</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Switch
            id="perishable-filter"
            checked={filters.perishable === true}
            onCheckedChange={(v) =>
              setFilters((f) => ({ ...f, perishable: v ? true : undefined, page: 1 }))
            }
          />
          <Label htmlFor="perishable-filter">Perishable only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="expired-filter"
            checked={filters.expired === true}
            onCheckedChange={(v) =>
              setFilters((f) => ({ ...f, expired: v ? true : undefined, page: 1 }))
            }
          />
          <Label htmlFor="expired-filter">Show expired</Label>
        </div>
        {/* Tag filter chips */}
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={filters.tags?.includes(tag.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                const current = filters.tags ?? []
                const next = current.includes(tag.id)
                  ? current.filter((id) => id !== tag.id)
                  : [...current, tag.id]
                setFilters((f) => ({ ...f, tags: next.length ? next : undefined, page: 1 }))
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : !data?.results.length ? (
        <EmptyState
          icon={Package}
          title="Your pantry is empty"
          description="Add ingredients to start generating personalized recipes."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first item
            </Button>
          }
        />
      ) : (
        <>
          <InventoryTable items={data.results} onEdit={openEdit} />
          <PaginationControls
            count={data.count}
            next={data.next}
            previous={data.previous}
            currentPage={filters.page ?? 1}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit item' : 'Add item to pantry'}</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={editItem ?? undefined}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
