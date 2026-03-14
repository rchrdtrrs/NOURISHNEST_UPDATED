import { Trophy, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { UserRewards } from '@/types/user.types'

interface RewardsCardProps {
  rewards: UserRewards
}

export function RewardsCard({ rewards }: RewardsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{rewards.points.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total points</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{rewards.streak_days}</p>
            <p className="text-sm text-muted-foreground">Day streak</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
