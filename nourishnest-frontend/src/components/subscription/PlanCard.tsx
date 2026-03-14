import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SubscriptionPlan, SubscriptionTier } from '@/types/user.types'

interface PlanCardProps {
  plan: SubscriptionPlan
  currentTier: SubscriptionTier
  onUpgrade: (planId: number) => void
  isLoading?: boolean
}

export function PlanCard({ plan, currentTier, onUpgrade, isLoading }: PlanCardProps) {
  const isCurrent = plan.tier === currentTier
  const isDowngrade =
    (currentTier === 'pro' && plan.tier !== 'pro') ||
    (currentTier === 'premium' && plan.tier === 'free')

  return (
    <Card className={plan.tier === 'premium' ? 'border-primary shadow-lg' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{plan.name}</CardTitle>
          {isCurrent && <Badge>Current plan</Badge>}
          {plan.tier === 'premium' && !isCurrent && <Badge variant="secondary">Popular</Badge>}
        </div>
        <p className="text-3xl font-bold">
          {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : 'default'}
          disabled={isCurrent || isDowngrade || isLoading}
          onClick={() => !isCurrent && !isDowngrade && onUpgrade(plan.id)}
        >
          {isCurrent ? 'Current plan' : isDowngrade ? 'Not available' : 'Upgrade'}
        </Button>
      </CardContent>
    </Card>
  )
}
