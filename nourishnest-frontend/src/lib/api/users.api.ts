import { apiClient } from './client'
import type {
  User,
  UserProfile,
  UserRewards,
  SubscriptionPlan,
  UpdateUserPayload,
  UpdateProfilePayload,
  UserSubscriptionStatus,
  PayPalInitiateResponse,
  PaymentTransaction,
  RedeemRewardRequest,
  RedeemRewardResponse,
} from '@/types/user.types'

export const usersApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/users/me/')
    return res.data
  },

  updateMe: async (data: UpdateUserPayload): Promise<User> => {
    const res = await apiClient.patch('/users/me/', data)
    return res.data
  },

  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get('/users/profile/')
    return res.data
  },

  updateProfile: async (data: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await apiClient.patch('/users/profile/', data)
    return res.data
  },

  getRewards: async (): Promise<UserRewards> => {
    const res = await apiClient.get('/users/rewards/')
    return res.data
  },

  redeemReward: async (data: RedeemRewardRequest): Promise<RedeemRewardResponse> => {
    const res = await apiClient.post('/users/rewards/redeem/', data)
    return res.data
  },

  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiClient.get('/subscription/plans/')
    return Array.isArray(res.data) ? res.data : (res.data.results ?? [])
  },

  upgradeSubscription: async (planId: number): Promise<User> => {
    const res = await apiClient.post('/subscription/upgrade/', { plan_id: planId })
    return res.data
  },

  initiatePayPalSubscription: async (planId: number): Promise<PayPalInitiateResponse> => {
    const res = await apiClient.post('/subscription/paypal/initiate/', { plan_id: planId })
    return res.data
  },

  confirmPayPalSubscription: async (subscriptionId: string, planId: number): Promise<User> => {
    const res = await apiClient.post('/subscription/paypal/confirm/', {
      subscription_id: subscriptionId,
      plan_id: planId,
    })
    return res.data.user
  },

  cancelSubscription: async (reason?: string): Promise<User> => {
    const res = await apiClient.post('/subscription/cancel/', { reason })
    return res.data.user
  },

  getSubscriptionStatus: async (): Promise<UserSubscriptionStatus> => {
    const res = await apiClient.get('/subscription/status/')
    return res.data
  },

  getTransactions: async (): Promise<PaymentTransaction[]> => {
    const res = await apiClient.get('/subscription/transactions/')
    return Array.isArray(res.data) ? res.data : (res.data.results ?? [])
  },
}
