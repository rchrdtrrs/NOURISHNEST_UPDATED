import { RewardsCard } from '@/components/rewards/RewardsCard'
import { StreakDisplay } from '@/components/rewards/StreakDisplay'
import { BadgeGrid } from '@/components/rewards/BadgeGrid'
import { RewardsStore } from '@/components/rewards/RewardsStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useRewards } from '@/hooks/useRewards'

export function RewardsPage() {
  const { data: rewards, isLoading } = useRewards()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (!rewards) return null

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Rewards</h1>
      <RewardsCard rewards={rewards} />
      <div className="rounded-lg border bg-card p-6">
        <StreakDisplay streakDays={rewards.streak_days} lastCooked={rewards.last_cooked} />
      </div>
      <RewardsStore />
      <div>
        <h2 className="text-lg font-semibold mb-4">Badges</h2>
        <BadgeGrid badges={rewards.badges} />
      </div>
    </div>
  )
}
