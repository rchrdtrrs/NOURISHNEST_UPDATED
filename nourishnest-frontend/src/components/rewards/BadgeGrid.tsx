import { cn } from '@/lib/utils'
import type { Badge } from '@/types/user.types'

const BADGE_META: Record<string, { emoji: string; description: string }> = {
  'Waste Warrior': {
    emoji: '♻️',
    description: 'Used only pantry ingredients for 5 meals',
  },
  'Budget Boss': {
    emoji: '💰',
    description: 'Saved $50 through home cooking',
  },
  'Green Chef': {
    emoji: '🌿',
    description: 'Cooked 10 vegetarian meals',
  },
  'Protein Pro': {
    emoji: '💪',
    description: 'Logged 10 high-protein meals',
  },
}

interface BadgeGridProps {
  badges: Badge[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const earned = new Set(badges.filter((b) => b.earned).map((b) => b.name))

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Object.entries(BADGE_META).map(([name, meta]) => {
        const isEarned = earned.has(name)
        return (
          <div
            key={name}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors',
              isEarned ? 'border-amber-200 bg-amber-50' : 'border-muted bg-muted/30 opacity-50'
            )}
          >
            <span className="text-3xl">{meta.emoji}</span>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
            {isEarned && <span className="text-xs font-medium text-amber-600">Earned!</span>}
          </div>
        )
      })}
    </div>
  )
}
