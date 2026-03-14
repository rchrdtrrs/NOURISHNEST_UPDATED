import { useEffect, useRef, useState } from 'react'
import { loadScript } from '@paypal/paypal-js'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useConfirmPayPalSubscription } from '@/hooks/useSubscription'

interface PayPalButtonProps {
  paypalPlanId: string
  planId: number
  onSuccess?: () => void
}

export function PayPalButton({ paypalPlanId, planId, onSuccess }: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const confirm = useConfirmPayPalSubscription()

  useEffect(() => {
    let isMounted = true

    async function initPayPal() {
      try {
        const paypal = await loadScript({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '',
          vault: true,
          intent: 'subscription',
        })

        if (!isMounted || !paypal?.Buttons || !containerRef.current) return

        setIsLoading(false)

        const buttons = paypal.Buttons({
          style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
          createSubscription: (_data: unknown, actions: { subscription: { create: (opts: { plan_id: string }) => Promise<string> } }) => {
            return actions.subscription.create({ plan_id: paypalPlanId })
          },
          onApprove: async (data: { subscriptionID?: string | null }) => {
            if (!data.subscriptionID) return
            await confirm.mutateAsync({ subscriptionId: data.subscriptionID, planId })
            onSuccess?.()
          },
          onError: () => {
            setError('PayPal encountered an error. Please try again.')
          },
        })

        if (containerRef.current) {
          await buttons.render(containerRef.current)
        }
      } catch {
        if (isMounted) setError('Failed to load PayPal. Please refresh and try again.')
      }
    }

    initPayPal()
    return () => { isMounted = false }
  }, [paypalPlanId, planId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
