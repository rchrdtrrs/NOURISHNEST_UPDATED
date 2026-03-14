import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakDisplayProps {
  streakDays: number
  lastCooked: string | null
}

export function StreakDisplay({ streakDays, lastCooked }: StreakDisplayProps) {
  const today = new Date()

  const cells = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today)
    day.setDate(today.getDate() - (6 - i))
    const label = day.toLocaleDateString('en-US', { weekday: 'short' })[0]
    const daysAgo = 6 - i
    const isActive = lastCooked !== null && daysAgo < streakDays
    return { label, isActive }
  })

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">This week</p>
      <div className="flex gap-2">
        {cells.map(({ label, isActive }, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                isActive ? 'bg-orange-100 text-orange-500' : 'bg-muted text-muted-foreground'
              )}
            >
              {isActive ? <Flame className="h-5 w-5" /> : <span className="text-xs">·</span>}
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
