import { toast } from 'sonner'
import { useUndoInventory } from '@/hooks/useInventory'

export function useUndoToast() {
  const undoMutation = useUndoInventory()

  const showUndoToast = (itemName: string) => {
    toast(`"${itemName}" removed`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => undoMutation.mutate(),
      },
    })
  }

  return { showUndoToast }
}
