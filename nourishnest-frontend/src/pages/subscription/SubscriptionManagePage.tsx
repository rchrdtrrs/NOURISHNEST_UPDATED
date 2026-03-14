import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SubscriptionDashboard } from '@/components/subscription/SubscriptionDashboard'
import { BillingHistory } from '@/components/subscription/BillingHistory'

export function SubscriptionManagePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link
          to="/subscription"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          View plans
        </Link>
        <h1 className="text-2xl font-bold">Manage subscription</h1>
        <p className="text-muted-foreground mt-1">
          View your billing details and manage your plan.
        </p>
      </div>

      <SubscriptionDashboard />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Billing history</h2>
        <BillingHistory />
      </div>
    </div>
  )
}
