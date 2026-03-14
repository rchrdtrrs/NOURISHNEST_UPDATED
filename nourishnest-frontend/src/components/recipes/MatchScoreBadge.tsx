import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MatchScoreBadgeProps {
  score: number
  className?: string
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const pct = Math.round(score * 100)
  return (
    <Badge
      className={cn(
        pct >= 80
          ? 'bg-green-100 text-green-800 border-green-300'
          : pct >= 50
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-gray-100 text-gray-600 border-gray-300',
        className
      )}
      variant="outline"
    >
      {pct}% match
    </Badge>
  )
}
