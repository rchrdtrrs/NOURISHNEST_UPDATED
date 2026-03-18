import { useMemo, useState } from 'react'
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useConfirmPayPalSubscription } from '@/hooks/useSubscription'

interface PayPalButtonProps {
  paypalPlanId: string
  planId: number
  onSuccess?: () => void
}

export function PayPalButton({ paypalPlanId, planId, onSuccess }: PayPalButtonProps) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? ''

  const scriptOptions = useMemo(
    () => ({
      clientId,
      vault: true,
      intent: 'subscription',
      components: 'buttons',
    }),
    [clientId],
  )

  if (!clientId) {
    return (
      <p className="text-sm text-destructive">
        PayPal is not configured. Please set VITE_PAYPAL_CLIENT_ID.
      </p>
    )
  }

  return (
    <PayPalScriptProvider options={scriptOptions}>
      <PayPalSubscriptionButtons
        paypalPlanId={paypalPlanId}
        planId={planId}
        onSuccess={onSuccess}
      />
    </PayPalScriptProvider>
  )
}

function PayPalSubscriptionButtons({
  paypalPlanId,
  planId,
  onSuccess,
}: PayPalButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const confirm = useConfirmPayPalSubscription()

  function stringifyPayPalError(err: unknown): string {
    if (!err) return 'Unknown PayPal error'
    if (typeof err === 'string') return err
    if (typeof err === 'object') {
      const maybeError = err as { message?: string; name?: string; details?: unknown; stack?: string }
      if (maybeError.message) return maybeError.message
      try {
        return JSON.stringify(err)
      } catch {
        return maybeError.name ?? 'Unknown PayPal error'
      }
    }
    return 'Unknown PayPal error'
  }

  function mapFriendlyPayPalError(detail: string): string {
    if (detail.includes('RESOURCE_NOT_FOUND') || detail.includes('INVALID_RESOURCE_ID')) {
      return 'This subscription plan does not belong to the current PayPal client ID. Use plan IDs created under the same sandbox app as VITE_PAYPAL_CLIENT_ID.'
    }
    return detail
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (isRejected) {
    return <p className="text-sm text-destructive">Failed to load PayPal. Please refresh and try again.</p>
  }

  return (
    <div>
      {isPending && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
      <PayPalButtons
        style={{ shape: 'pill', color: 'black', layout: 'horizontal', label: 'subscribe' }}
        forceReRender={[paypalPlanId]}
        createSubscription={(_data, actions) => {
          return actions.subscription.create({ plan_id: paypalPlanId })
        }}
        onApprove={async (data) => {
          if (!data.subscriptionID) return
          await confirm.mutateAsync({ subscriptionId: data.subscriptionID, planId })
          onSuccess?.()
        }}
        onError={(err) => {
          const detail = stringifyPayPalError(err)
          const friendlyDetail = mapFriendlyPayPalError(detail)
          console.error('PayPal subscription error', {
            planId,
            paypalPlanId,
            detail,
            friendlyDetail,
            rawError: err,
          })
          setError(`PayPal encountered an error. ${friendlyDetail}`)
        }}
        onCancel={(data) => {
          console.info('PayPal subscription cancelled by user', {
            planId,
            paypalPlanId,
            data,
          })
        }}
      />
    </div>
  )
}
