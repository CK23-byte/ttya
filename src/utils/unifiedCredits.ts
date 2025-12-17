/**
 * Unified Credit System
 *
 * Single credit type with conversions:
 * - 10 credits = 500 messages OR 5 minutes voice OR 1 minute video
 * - 1 credit = 50 messages
 * - 1 credit = 0.5 minutes (30 seconds) voice
 * - 1 credit = 0.1 minutes (6 seconds) video
 */

import { isTestAccount, getDisplayCredits } from './testAccount'

// Credit conversion rates (per credit)
export const UNIFIED_CREDIT_RATES = {
  MESSAGES_PER_CREDIT: 50,      // 1 credit = 50 messages
  VOICE_SECONDS_PER_CREDIT: 30,  // 1 credit = 30 seconds voice
  VIDEO_SECONDS_PER_CREDIT: 6,   // 1 credit = 6 seconds video
} as const

// Credit costs (per unit)
export const UNIFIED_CREDIT_COSTS = {
  PER_MESSAGE: 1 / UNIFIED_CREDIT_RATES.MESSAGES_PER_CREDIT,           // 0.02 credits
  PER_VOICE_MINUTE: 60 / UNIFIED_CREDIT_RATES.VOICE_SECONDS_PER_CREDIT, // 2 credits
  PER_VIDEO_MINUTE: 60 / UNIFIED_CREDIT_RATES.VIDEO_SECONDS_PER_CREDIT, // 10 credits
  PER_VOICE_SECOND: 1 / UNIFIED_CREDIT_RATES.VOICE_SECONDS_PER_CREDIT,  // ~0.033 credits
  PER_VIDEO_SECOND: 1 / UNIFIED_CREDIT_RATES.VIDEO_SECONDS_PER_CREDIT,  // ~0.167 credits
} as const

// Credit packages (one-time purchases)
export const UNIFIED_CREDIT_PACKS = {
  starter: {
    name: 'Starter Pack',
    credits: 10,
    price: 4.99,
    pricePerCredit: 0.499,
    description: 'Perfect to try it out',
    examples: ['500 messages', '5 min voice', '1 min video'],
    priceId: 'credits_starter',
  },
  basic: {
    name: 'Basic Pack',
    credits: 50,
    price: 19.99,
    pricePerCredit: 0.40,
    description: 'For regular use',
    examples: ['2,500 messages', '25 min voice', '5 min video'],
    priceId: 'credits_basic',
  },
  popular: {
    name: 'Popular Pack',
    credits: 100,
    price: 34.99,
    pricePerCredit: 0.35,
    description: 'Most popular choice',
    popular: true,
    examples: ['5,000 messages', '50 min voice', '10 min video'],
    priceId: 'credits_popular',
  },
  pro: {
    name: 'Pro Pack',
    credits: 250,
    price: 74.99,
    pricePerCredit: 0.30,
    description: 'Best value for power users',
    bestValue: true,
    examples: ['12,500 messages', '125 min voice', '25 min video'],
    priceId: 'credits_pro',
  },
} as const

export type UnifiedCreditPackType = keyof typeof UNIFIED_CREDIT_PACKS

// Calculate cost in credits for different actions
export function calculateMessageCost(messageCount: number = 1): number {
  return messageCount * UNIFIED_CREDIT_COSTS.PER_MESSAGE
}

export function calculateVoiceCost(seconds: number): number {
  return seconds * UNIFIED_CREDIT_COSTS.PER_VOICE_SECOND
}

export function calculateVideoCost(seconds: number): number {
  return seconds * UNIFIED_CREDIT_COSTS.PER_VIDEO_SECOND
}

// Check if user can afford an action
export function canAffordAction(
  userEmail: string | null | undefined,
  currentCredits: number,
  requiredCredits: number
): boolean {
  // Test account has unlimited credits
  if (isTestAccount(userEmail)) {
    return true
  }

  return currentCredits >= requiredCredits
}

// Format credits for display
export function formatCredits(
  userEmail: string | null | undefined,
  credits: number
): string {
  return getDisplayCredits(userEmail, credits)
}

// Calculate what user can do with their credits
export function getUsageEstimates(credits: number): {
  messages: number
  voiceMinutes: number
  videoMinutes: number
} {
  return {
    messages: Math.floor(credits * UNIFIED_CREDIT_RATES.MESSAGES_PER_CREDIT),
    voiceMinutes: Number((credits * UNIFIED_CREDIT_RATES.VOICE_SECONDS_PER_CREDIT / 60).toFixed(1)),
    videoMinutes: Number((credits * UNIFIED_CREDIT_RATES.VIDEO_SECONDS_PER_CREDIT / 60).toFixed(1)),
  }
}

// Signup bonus in unified credits
export const SIGNUP_BONUS_CREDITS = 10 // Same value as before: 500 messages OR 5min voice OR 1min video
