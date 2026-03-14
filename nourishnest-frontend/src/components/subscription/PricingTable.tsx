import { useState } from 'react'
import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useSubscriptionPlans, useInitiatePayPalSubscription } from '@/hooks/useSubscription'
import { PayPalButton } from './PayPalButton'
import { useAuth } from '@/context/AuthContext'
import type { SubscriptionPlan } from '@/types/user.types'

interface ActivePayPalPlan {
  paypalPlanId: string
  planId: number
}

function PlanCard({
  plan,
  currentTier,
  onSelectPayPal,
  activePlan,
}: {
  plan: SubscriptionPlan
  currentTier: string
  onSelectPayPal: (plan: ActivePayPalPlan | null) => void
  activePlan: ActivePayPalPlan | null
}) {
  const initiate = useInitiatePayPalSubscription()
  const isCurrent = plan.tier === currentTier
  const isPopular = plan.tier === 'premium'
  const isFree = plan.price === 0
  const isShowingPayPal = activePlan?.planId === plan.id

  async function handleUpgradeClick() {
    if (isShowingPayPal) {
      onSelectPayPal(null)
      return
    }
    const result = await initiate.mutateAsync(plan.id)
    onSelectPayPal({ paypalPlanId: result.paypal_plan_id, planId: plan.id })
  }

  return (
    <Card className={`flex flex-col ${isPopular ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{plan.name}</CardTitle>
          <div className="flex gap-1">
            {isCurrent && <Badge>Current plan</Badge>}
            {isPopular && !isCurrent && <Badge variant="secondary">Popular</Badge>}
          </div>
        </div>
        <p className="text-3xl font-bold mt-1">
          {isFree ? 'Free' : `$${plan.price}/mo`}
        </p>
        {plan.description && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4">
        <ul className="space-y-2 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>

        {isCurrent ? (
          <Button className="w-full" variant="outline" disabled>
            Current plan
          </Button>
        ) : isFree ? (
          <Button className="w-full" variant="outline" disabled>
            Free forever
          </Button>
        ) : (
          <>
            <Button
              className="w-full"
              onClick={handleUpgradeClick}
              disabled={initiate.isPending}
            >
              {initiate.isPending && activePlan === null ? (
                <LoadingSpinner />
              ) : isShowingPayPal ? (
                'Hide PayPal'
              ) : (
                'Upgrade with PayPal'
              )}
            </Button>
            {isShowingPayPal && (
              <PayPalButton
                paypalPlanId={activePlan!.paypalPlanId}
                planId={activePlan!.planId}
                onSuccess={() => onSelectPayPal(null)}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function PricingTable() {
  const { user } = useAuth()
  const { data: plans, isLoading } = useSubscriptionPlans()
  const [activePlan, setActivePlan] = useState<ActivePayPalPlan | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {(plans ?? []).map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          currentTier={user?.subscription_tier ?? 'free'}
          onSelectPayPal={setActivePlan}
          activePlan={activePlan}
        />
      ))}
    </div>
  )
}
