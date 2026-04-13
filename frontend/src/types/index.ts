export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export interface User {
  id: number
  telegram_id: string
  username?: string
  first_name?: string
  fire_coins: number
  free_used: boolean
  subscription?: Subscription | null
  referral_code: string
  referrals_count: number
  total_generations: number
  created_at: string
}

export interface Subscription {
  plan: 'basic' | 'pro' | 'max'
  expires_at: string
  fire_coins_monthly: number
  is_active: boolean
}

export interface Style {
  id: string
  name: string
  category: 'standard' | 'premium'
  image: string
  price_fast: number
  price_standard: number
  price_premium: number
  badge?: string
  tags: string[]
  prompt: string
  trending?: boolean
  popular?: boolean
  new?: boolean
}

export interface Generation {
  id: string
  style_id: string
  style_name: string
  tier: GenerationTier
  cost: number
  status: GenerationStatus
  images: string[]
  created_at: string
}

export type GenerationTier = 'fast' | 'standard' | 'premium'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface CoinPack {
  id: string
  price_rub: number
  coins: number
  label?: string
  popular?: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price_rub: number
  coins_monthly: number
  perks: string[]
  popular?: boolean
}

export interface DirectProduct {
  id: string
  name: string
  price_rub: number
  tier: GenerationTier
  description: string
}

export type PaywallTab = 'generation' | 'coins' | 'subscription'

export interface Transaction {
  id: string
  type: 'purchase' | 'generation' | 'referral' | 'subscription'
  amount: number
  coins_change: number
  description: string
  created_at: string
}
