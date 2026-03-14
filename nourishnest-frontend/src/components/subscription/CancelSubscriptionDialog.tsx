import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCancelSubscription } from '@/hooks/useSubscription'

const CANCEL_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'not_using_enough', label: "Not using it enough" },
  { value: 'switching_service', label: 'Switching to another service' },
  { value: 'other', label: 'Other' },
]

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelSubscriptionDialog({ open, onOpenChange }: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState('')
  const cancel = useCancelSubscription()

  async function handleConfirm() {
    await cancel.mutateAsync(reason || undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel subscription?</DialogTitle>
          <DialogDescription>
            You'll immediately lose access to AI recipe generation limits, nutrition analytics, and
            other premium features. Your data will be preserved.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Reason for cancelling (optional)" />
            </SelectTrigger>
            <SelectContent>
              {CANCEL_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={cancel.isPending}
          >
            {cancel.isPending ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
