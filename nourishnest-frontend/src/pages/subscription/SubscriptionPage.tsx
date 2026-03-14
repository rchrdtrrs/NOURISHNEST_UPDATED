import { Link } from 'react-router-dom'
import { PricingTable } from '@/components/subscription/PricingTable'
import { useAuth } from '@/context/AuthContext'
import { useSubscriptionStatus } from '@/hooks/useSubscription'

export function SubscriptionPage() {
  const { user } = useAuth()
  const { data: subStatus } = useSubscriptionStatus()

  const hasActivePaidSub =
    user?.subscription_tier !== 'free' &&
    (subStatus?.status === 'ACTIVE' || subStatus?.status === 'APPROVED')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Choose your plan</h1>
        <p className="text-muted-foreground mt-1">
          Current plan:{' '}
          <span className="font-medium capitalize">{user?.subscription_tier}</span>
        </p>
      </div>

      {hasActivePaidSub && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          You have an active subscription.{' '}
          <Link to="/subscription/manage" className="font-medium underline underline-offset-4">
            Manage subscription →
          </Link>
        </div>
      )}

      <PricingTable />
    </div>
  )
}
