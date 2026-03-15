import type { ComponentType } from 'react'

export type SubscriptionTier = 'free' | 'premium' | 'pro'

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  subscription_tier: SubscriptionTier
  is_premium: boolean
  date_joined: string
}

export interface UserProfile {
  id: number
  user: number
  height_cm: number | null
  weight_kg: number | null
  allergies: string[]
  dietary_restrictions: string[]
  fitness_goals: string[]
  budget_limit: number | null
  calorie_target: number | null
  has_advanced_analytics?: boolean
  has_ai_substitutions?: boolean
  theme_slugs?: string[]
}

export interface UserRewards {
  points: number
  streak_days: number
  badges: Badge[]
  last_cooked: string | null
}

export interface Badge {
  name: string
  earned: boolean
  earned_at: string | null
}

export interface SubscriptionPlan {
  id: number
  name: string
  tier: SubscriptionTier
  price: number
  features: string[]
}

export interface UpdateUserPayload {
  username?: string
  first_name?: string
  last_name?: string
}

export interface UserProfilePayload {
  height_cm?: number | null
  weight_kg?: number | null
  allergies?: string[]
  dietary_restrictions?: string[]
  fitness_goals?: string[]
  budget_limit?: number | null
  calorie_target?: number | null
}

// Reward System Types
export type RewardType = 'advanced_analytics' | 'ai_substitutions' | 'theme' | 'chef_recipe' | 'badge'

export interface RewardPerk {
  id: string
  type: RewardType
  name: string
  description: string
  pointCost: number
  icon: ComponentType<{ className?: string }>
  value?: string // For theme slug, recipe ID, or badge name
}

export interface RedeemRewardRequest {
  reward_type: RewardType
  value?: string
}

export interface RedeemRewardResponse {
  success: boolean
  message: string
  points_remaining: number
  reward_type: RewardType
  unlocked_item?: string
}

export interface RewardsStoreItem {
  category: 'Premium Features' | 'Themes' | 'Recipes' | 'Badges' | 'Exclusive Content'
  items: RewardPerk[]
}

export interface UpdateProfilePayload {
  height_cm?: number | null
  weight_kg?: number | null
  allergies?: string[]
  dietary_restrictions?: string[]
  fitness_goals?: string[]
  budget_limit?: number | null
  calorie_target?: number | null
}

export interface UserSubscriptionStatus {
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED' | null
  start_time: string | null
  next_billing_time: string | null
  paypal_subscription_id: string | null
  subscription_type: SubscriptionTier
}

export interface PayPalInitiateResponse {
  paypal_plan_id: string
  subscription_type: SubscriptionTier
}

export interface PaymentTransaction {
  id: number
  paypal_transaction_id: string
  paypal_subscription_id: string
  amount: string
  currency: string
  status: string
  created_at: string
}
