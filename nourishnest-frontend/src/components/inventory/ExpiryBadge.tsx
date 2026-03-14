import { Badge } from '@/components/ui/badge'
import { daysUntil } from '@/lib/utils'

interface ExpiryBadgeProps {
  expiryDate: string | null
}

export function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  if (!expiryDate) return null

  const days = daysUntil(expiryDate)

  if (days < 0) {
    return <Badge variant="destructive">Expired</Badge>
  }
  if (days <= 7) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
        {days === 0 ? 'Expires today' : `${days}d left`}
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
      {days}d left
    </Badge>
  )
}
