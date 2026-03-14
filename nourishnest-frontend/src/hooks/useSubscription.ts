import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi } from '@/lib/api/users.api'
import { queryKeys } from '@/lib/queryKeys'

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans(),
    queryFn: usersApi.getSubscriptionPlans,
  })
}

export function useUpgradeSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: number) => usersApi.upgradeSubscription(planId),
    onSuccess: (updatedUser) => {
      qc.setQueryData(queryKeys.currentUser(), updatedUser)
      qc.invalidateQueries({ queryKey: queryKeys.currentUser() })
      toast.success(`Upgraded to ${updatedUser.subscription_tier} plan!`)
    },
    onError: () => toast.error('Upgrade failed. Please try again.'),
  })
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: queryKeys.subscriptionStatus(),
    queryFn: usersApi.getSubscriptionStatus,
  })
}

export function useInitiatePayPalSubscription() {
  return useMutation({
    mutationFn: (planId: number) => usersApi.initiatePayPalSubscription(planId),
    onError: () => toast.error('Failed to initiate PayPal subscription. Please try again.'),
  })
}

export function useConfirmPayPalSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ subscriptionId, planId }: { subscriptionId: string; planId: number }) =>
      usersApi.confirmPayPalSubscription(subscriptionId, planId),
    onSuccess: (updatedUser) => {
      qc.setQueryData(queryKeys.currentUser(), updatedUser)
      qc.invalidateQueries({ queryKey: queryKeys.currentUser() })
      qc.invalidateQueries({ queryKey: queryKeys.subscriptionStatus() })
      toast.success(`Subscription activated! Welcome to ${updatedUser.subscription_tier}!`)
    },
    onError: () => toast.error('Failed to activate subscription. Please contact support.'),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason?: string) => usersApi.cancelSubscription(reason),
    onSuccess: (updatedUser) => {
      qc.setQueryData(queryKeys.currentUser(), updatedUser)
      qc.invalidateQueries({ queryKey: queryKeys.currentUser() })
      qc.invalidateQueries({ queryKey: queryKeys.subscriptionStatus() })
      toast.success('Subscription cancelled successfully.')
    },
    onError: () => toast.error('Failed to cancel subscription. Please try again.'),
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions(),
    queryFn: usersApi.getTransactions,
  })
}
