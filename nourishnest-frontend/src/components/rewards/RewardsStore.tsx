import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Palette,
  ChefHat,
  Badge,
  AlertCircle,
  Check,
} from 'lucide-react'
import { useRewards, useRedeemReward } from '@/hooks/useRewards'
import { useProfile } from '@/hooks/useProfile'
import type { RewardPerk, RedeemRewardRequest } from '@/types/user.types'
import { cn } from '@/lib/utils'

const REWARD_PERKS: RewardPerk[] = [
  {
    id: 'advanced-analytics',
    type: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Unlock detailed insights into your nutrition, spending patterns, and cooking habits.',
    pointCost: 100,
    icon: Zap,
  },
  {
    id: 'ai-substitutions',
    type: 'ai_substitutions',
    name: 'AI Ingredient Substitutions',
    description:
      'Use AI to suggest ingredient substitutions based on allergies, preferences, and availability.',
    pointCost: 100,
    icon: Zap,
  },
  {
    id: 'recipe-generation',
    type: 'recipe_generation',
    name: 'Recipe Generation Attempt',
    description: 'Use AI to generate custom recipes based on your ingredients and preferences. One attempt per redemption.',
    pointCost: 20,
    icon: ChefHat,
  },
  {
    id: 'theme-dark',
    type: 'theme',
    name: 'Dark Khaki Theme',
    description: 'A warm dark theme with khaki accents for a cozy cooking experience.',
    pointCost: 50,
    icon: Palette,
    value: 'dark-khaki',
  },
  {
    id: 'theme-forest',
    type: 'theme',
    name: 'Forest Green Theme',
    description: 'Nature-inspired green theme perfect for the farm-to-table enthusiast.',
    pointCost: 50,
    icon: Palette,
    value: 'forest-green',
  },
  {
    id: 'chef-recipes',
    type: 'chef_recipe',
    name: 'Chef-Curated Recipes',
    description: 'Access exclusive recipes from renowned chefs. (Per recipe)',
    pointCost: 75,
    icon: ChefHat,
  },
  {
    id: 'badge-master-chef',
    type: 'badge',
    name: 'Master Chef Badge',
    description: 'Show off your culinary expertise with an exclusive badge.',
    pointCost: 30,
    icon: Badge,
    value: 'master-chef',
  },
  {
    id: 'badge-nutrition-master',
    type: 'badge',
    name: 'Nutrition Master Badge',
    description: 'Earned for mastering nutritional knowledge.',
    pointCost: 30,
    icon: Badge,
    value: 'nutrition-master',
  },
]

interface RewardConfirmationModalProps {
  isOpen: boolean
  perk: RewardPerk | null
  pointCost: number
  currentPoints: number
  onConfirm: (perk: RewardPerk) => void
  onOpenChange: (open: boolean) => void
  isLoading: boolean
}

function RewardConfirmationModal({
  isOpen,
  perk,
  pointCost,
  currentPoints,
  onConfirm,
  onOpenChange,
  isLoading,
}: RewardConfirmationModalProps) {
  const hasEnoughPoints = currentPoints >= pointCost

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-amber-900 bg-amber-50">
        <DialogHeader>
          <DialogTitle className="text-amber-950">Confirm Reward Redemption</DialogTitle>
          <DialogDescription className="text-amber-800">
            Are you sure you want to unlock this reward?
          </DialogDescription>
        </DialogHeader>

        {perk && (
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <perk.icon className="h-6 w-6 text-amber-700" />
                <h3 className="font-semibold text-amber-950">{perk.name}</h3>
              </div>
              <p className="text-sm text-amber-800">{perk.description}</p>
            </div>

            <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Cost:</span>
                <span className="font-semibold text-amber-950">{pointCost} points</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Your Points:</span>
                <span
                  className={cn(
                    'font-semibold',
                    hasEnoughPoints ? 'text-green-700' : 'text-red-700'
                  )}
                >
                  {currentPoints}
                </span>
              </div>
              {hasEnoughPoints && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-800">Remaining:</span>
                  <span className="font-semibold text-amber-950">{currentPoints - pointCost}</span>
                </div>
              )}
            </div>

            {!hasEnoughPoints && (
              <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  You don't have enough points. You need {pointCost - currentPoints} more points.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-amber-900 text-amber-950 hover:bg-amber-100"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-700 text-white hover:bg-amber-800"
                onClick={() => onConfirm(perk)}
                disabled={!hasEnoughPoints || isLoading}
              >
                {isLoading ? 'Processing...' : 'Unlock Reward'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface RewardCardProps {
  perk: RewardPerk
  currentPoints: number
  isUnlocked: boolean
  onSelect: (perk: RewardPerk) => void
}

function RewardCard({ perk, currentPoints, isUnlocked, onSelect }: RewardCardProps) {
  const hasEnoughPoints = currentPoints >= perk.pointCost
  const Icon = perk.icon

  return (
    <div
      className={cn(
        'group relative rounded-lg border-2 p-4 transition-all',
        isUnlocked
          ? 'border-green-300 bg-green-50 shadow-md'
          : hasEnoughPoints
            ? 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-md'
            : 'border-amber-100 bg-amber-50'
      )}
    >
      {isUnlocked && (
        <div className="absolute right-3 top-3 rounded-full bg-green-500 p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn('h-5 w-5', isUnlocked ? 'text-green-700' : 'text-amber-700')} />
        <h3
          className={cn(
            'font-semibold',
            isUnlocked ? 'text-green-900' : 'text-amber-950'
          )}
        >
          {perk.name}
        </h3>
      </div>

      <p className={cn('mb-4 text-sm', isUnlocked ? 'text-green-800' : 'text-amber-800')}>
        {perk.description}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-sm font-semibold',
            isUnlocked
              ? 'text-green-700'
              : hasEnoughPoints
                ? 'text-amber-700'
                : 'text-amber-600'
          )}
        >
          <Zap className="h-3 w-3" />
          {perk.pointCost} points
        </span>

        {!isUnlocked && (
          <Button
            size="sm"
            variant={hasEnoughPoints ? 'default' : 'outline'}
            className={cn(
              'text-xs',
              hasEnoughPoints
                ? 'bg-amber-700 text-white hover:bg-amber-800'
                : 'border-amber-300 text-amber-600'
            )}
            onClick={() => onSelect(perk)}
            disabled={!hasEnoughPoints}
          >
            {hasEnoughPoints ? 'Unlock' : 'Need More Points'}
          </Button>
        )}
      </div>
    </div>
  )
}

export function RewardsStore() {
  const [selectedPerk, setSelectedPerk] = useState<RewardPerk | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: rewards, isLoading: isLoadingRewards } = useRewards()
  const { data: profile } = useProfile()
  const { mutate: redeemReward, isPending: isRedeemingReward } = useRedeemReward()

  const currentPoints = rewards?.points ?? 0

  // Determine unlocked rewards
  const unlockedRewardIds = new Set<string>()
  if (profile?.has_advanced_analytics) unlockedRewardIds.add('advanced-analytics')
  if (profile?.has_ai_substitutions) unlockedRewardIds.add('ai-substitutions')
  if (profile?.theme_slugs) {
    profile.theme_slugs.forEach((slug) => {
      if (slug === 'dark-khaki') unlockedRewardIds.add('theme-dark')
      if (slug === 'forest-green') unlockedRewardIds.add('theme-forest')
    })
  }

  const handleSelectPerk = (perk: RewardPerk) => {
    setSelectedPerk(perk)
    setIsModalOpen(true)
  }

  const handleConfirmRedemption = (perk: RewardPerk) => {
    const request: RedeemRewardRequest = {
      reward_type: perk.type,
      value: perk.value,
    }

    redeemReward(request, {
      onSuccess: (response) => {
        setIsModalOpen(false)
        toast.success(response.message, {
          description: response.unlocked_item || `${perk.name} unlocked!`,
        })
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Failed to redeem reward'
        toast.error('Redemption Failed', {
          description: errorMessage,
        })
      },
    })
  }

  if (isLoadingRewards) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-amber-800">Loading rewards store...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6">
      {/* Points Summary */}
      <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-amber-800">Your Reward Points</p>
            <p className="text-3xl font-bold text-amber-950">{currentPoints}</p>
          </div>
          <Zap className="h-12 w-12 text-amber-600" />
        </div>
      </div>

      {/* Premium Features Section */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-amber-950">Premium Features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARD_PERKS.filter((p) => p.type.includes('analytics') || p.type.includes('ai')).map(
            (perk) => (
              <RewardCard
                key={perk.id}
                perk={perk}
                currentPoints={currentPoints}
                isUnlocked={unlockedRewardIds.has(perk.id)}
                onSelect={handleSelectPerk}
              />
            )
          )}
        </div>
      </div>

      {/* AI Recipe Generation Section */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-amber-950">AI Recipe Generation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARD_PERKS.filter((p) => p.type === 'recipe_generation').map((perk) => (
            <RewardCard
              key={perk.id}
              perk={perk}
              currentPoints={currentPoints}
              isUnlocked={false}
              onSelect={handleSelectPerk}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-amber-700">
          🤖 Generate custom recipes using AI! Each redemption gives you one attempt. Spend points to unlock as many recipe generation attempts as you need.
        </p>
      </div>

      {/* Themes Section */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-amber-950">Themes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARD_PERKS.filter((p) => p.type === 'theme').map((perk) => (
            <RewardCard
              key={perk.id}
              perk={perk}
              currentPoints={currentPoints}
              isUnlocked={unlockedRewardIds.has(perk.id)}
              onSelect={handleSelectPerk}
            />
          ))}
        </div>
      </div>

      {/* Exclusive Content Section */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-amber-950">Exclusive Content</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARD_PERKS.filter((p) => p.type === 'chef_recipe').map((perk) => (
            <RewardCard
              key={perk.id}
              perk={perk}
              currentPoints={currentPoints}
              isUnlocked={unlockedRewardIds.has(perk.id)}
              onSelect={handleSelectPerk}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-amber-700">
          🔥 Note: Chef-curated recipes are sold individually. Spend 75 points per recipe to unlock
          exclusive content from renowned chefs.
        </p>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-amber-950">Badges & Collectibles</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARD_PERKS.filter((p) => p.type === 'badge').map((perk) => (
            <RewardCard
              key={perk.id}
              perk={perk}
              currentPoints={currentPoints}
              isUnlocked={unlockedRewardIds.has(perk.id)}
              onSelect={handleSelectPerk}
            />
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <RewardConfirmationModal
        isOpen={isModalOpen}
        perk={selectedPerk}
        pointCost={selectedPerk?.pointCost ?? 0}
        currentPoints={currentPoints}
        onConfirm={handleConfirmRedemption}
        onOpenChange={setIsModalOpen}
        isLoading={isRedeemingReward}
      />
    </div>
  )
}
