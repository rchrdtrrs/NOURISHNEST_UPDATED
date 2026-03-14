import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscriptionStatus } from '@/hooks/useSubscription'
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog'
import { useAuth } from '@/context/AuthContext'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  APPROVED: 'default',
  SUSPENDED: 'destructive',
  CANCELLED: 'outline',
  EXPIRED: 'outline',
  APPROVAL_PENDING: 'secondary',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function SubscriptionDashboard() {
  const { user } = useAuth()
  const { data: subStatus, isLoading } = useSubscriptionStatus()
  const [cancelOpen, setCancelOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const hasActiveSub = subStatus?.status === 'ACTIVE' || subStatus?.status === 'APPROVED'
  const statusVariant = STATUS_VARIANTS[subStatus?.status ?? ''] ?? 'outline'

  if (!hasActiveSub || user?.subscription_tier === 'free') {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-muted-foreground">You are on the free plan.</p>
          <Button asChild>
            <Link to="/subscription">View plans</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Current subscription</CardTitle>
          {subStatus?.status && (
            <Badge variant={statusVariant}>{subStatus.status}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium capitalize">{user?.subscription_tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-medium">{formatDate(subStatus?.next_billing_time ?? null)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium">{formatDate(subStatus?.start_time ?? null)}</span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              Cancel subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <CancelSubscriptionDialog open={cancelOpen} onOpenChange={setCancelOpen} />
    </>
  )
}
