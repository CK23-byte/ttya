/**
 * Stripe Configuration
 *
 * Handles Stripe integration for subscription payments
 * Uses Stripe Payment Links for client-side only checkout (no backend needed)
 */

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

export function isStripeConfigured(): boolean {
  return !!STRIPE_PUBLISHABLE_KEY
}

export function arePaymentLinksConfigured(): boolean {
  return Object.values(PAYMENT_LINKS).some(link => !!link)
}

// Subscription Plans Configuration - Universal Credits System
// 1 credit = 1 text message, 5 seconds voice, or 3 seconds video
// Optimized for 300%+ profit margins
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    description: 'Try it out',
    credits: 50,
    profiles: 1,
    features: [
      '50 universal credits',
      '1 AI Personality',
      'Text chat only',
      'Basic chat themes',
      'Upload 1 chat archive',
    ],
    monthly: {
      price: 0,
      priceId: 'free',
    },
    yearly: {
      price: 0,
      priceId: 'free',
    },
  },
  starter: {
    name: 'Starter',
    description: 'Perfect for getting started',
    credits: 350,
    profiles: 1,
    features: [
      '350 universal credits per month',
      '1 AI Personality',
      'Text, voice & video chat',
      'All chat themes',
      'Priority generation',
      'Upload up to 3 chat archives',
    ],
    monthly: {
      price: 9.99,
      priceId: 'starter_monthly',
    },
    yearly: {
      price: 99,
      priceId: 'starter_yearly',
      savings: '17%',
    },
  },
  pro: {
    name: 'Pro',
    description: 'Deep, emotional continuity',
    popular: true,
    credits: 900,
    profiles: 5,
    features: [
      '900 universal credits per month',
      '5 AI Personalities',
      'Text, voice & video chat',
      'Faster responses',
      'All chat themes',
      'Unlimited chat archives',
      'Conversation memory enhancement',
    ],
    monthly: {
      price: 24.99,
      priceId: 'pro_monthly',
    },
    yearly: {
      price: 249,
      priceId: 'pro_yearly',
      savings: '17%',
    },
  },
  premium: {
    name: 'Premium',
    description: 'Closest experience to real life',
    credits: 1800,
    profiles: 999,
    features: [
      '1,800 universal credits per month',
      'Unlimited AI Personalities',
      'Text, voice & video chat',
      'Ultra fast responses',
      'Extended memory model',
      'Priority support',
    ],
    monthly: {
      price: 49.99,
      priceId: 'premium_monthly',
    },
    yearly: {
      price: 499,
      priceId: 'premium_yearly',
      savings: '17%',
    },
  },
} as const

// Voice Credits (separate from text subscriptions)
// 1 voice credit = 30 seconds of voice call (2 credits per minute)
export const VOICE_CREDIT_PACKS = {
  small: {
    name: '50 Voice Credits',
    credits: 50,
    minutes: 25,
    price: 5.99,
    pricePerCredit: 0.12,
    priceId: 'voice_credits_50',
  },
  medium: {
    name: '100 Voice Credits',
    credits: 100,
    minutes: 50,
    price: 9.99,
    pricePerCredit: 0.10,
    popular: true,
    priceId: 'voice_credits_100',
  },
  large: {
    name: '500 Voice Credits',
    credits: 500,
    minutes: 250,
    price: 39.99,
    pricePerCredit: 0.08,
    bestValue: true,
    priceId: 'voice_credits_500',
  },
} as const

// Video Credits (separate from text subscriptions and voice credits)
// 1 video credit = 12 seconds of video call (5 credits per minute)
export const VIDEO_CREDIT_PACKS = {
  small: {
    name: '50 Video Credits',
    credits: 50,
    minutes: 10,
    price: 19.99,
    pricePerCredit: 0.40,
    priceId: 'video_credits_50',
  },
  medium: {
    name: '100 Video Credits',
    credits: 100,
    minutes: 20,
    price: 34.99,
    pricePerCredit: 0.35,
    popular: true,
    priceId: 'video_credits_100',
  },
  large: {
    name: '500 Video Credits',
    credits: 500,
    minutes: 100,
    price: 149.99,
    pricePerCredit: 0.30,
    bestValue: true,
    priceId: 'video_credits_500',
  },
} as const

// Universal Credits (can be used for text, voice, AND video)
// 1 credit = 1 text message, 5 seconds of voice, or 3 seconds of video
// Optimized for 300%+ margins while being competitive
export const UNIVERSAL_CREDIT_PACKS = {
  small: {
    name: '150 Universal Credits',
    credits: 150,
    price: 9.99,
    pricePerCredit: 0.0666,
    description: '150 messages, 12.5 min voice, or 7.5 min video',
    priceId: 'universal_credits_150',
    popular: false,
    bestValue: false,
  },
  medium: {
    name: '600 Universal Credits',
    credits: 600,
    price: 39.99,
    pricePerCredit: 0.0666,
    popular: true,
    bestValue: false,
    description: '600 messages, 50 min voice, or 30 min video',
    priceId: 'universal_credits_600',
  },
  large: {
    name: '1,200 Universal Credits',
    credits: 1200,
    price: 69.99,
    pricePerCredit: 0.0583,
    popular: false,
    bestValue: false,
    description: '1.2K messages, 100 min voice, or 60 min video',
    priceId: 'universal_credits_1200',
  },
  xlarge: {
    name: '3,000 Universal Credits',
    credits: 3000,
    price: 149.99,
    pricePerCredit: 0.05,
    description: '3K messages, 250 min voice, or 150 min video',
    priceId: 'universal_credits_3000',
    popular: false,
    bestValue: true,
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS
export type VoiceCreditPackType = keyof typeof VOICE_CREDIT_PACKS
export type VideoCreditPackType = keyof typeof VIDEO_CREDIT_PACKS
export type UniversalCreditPackType = keyof typeof UNIVERSAL_CREDIT_PACKS
export type BillingPeriod = 'monthly' | 'yearly'

// Payment Links - Create these in Stripe Dashboard > Products > Payment Links
export const PAYMENT_LINKS: Record<string, string> = {
  // Subscriptions
  starter_monthly: import.meta.env.VITE_STRIPE_STARTER_MONTHLY_LINK || '',
  starter_yearly: import.meta.env.VITE_STRIPE_STARTER_YEARLY_LINK || '',
  pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_LINK || '',
  pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_LINK || '',
  premium_monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_LINK || '',
  premium_yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_LINK || '',
  // Voice Credit Packs
  voice_credits_50: import.meta.env.VITE_STRIPE_VOICE_CREDITS_50_LINK || '',
  voice_credits_100: import.meta.env.VITE_STRIPE_VOICE_CREDITS_100_LINK || '',
  voice_credits_500: import.meta.env.VITE_STRIPE_VOICE_CREDITS_500_LINK || '',
  // Video Credit Packs
  video_credits_50: import.meta.env.VITE_STRIPE_VIDEO_CREDITS_50_LINK || '',
  video_credits_100: import.meta.env.VITE_STRIPE_VIDEO_CREDITS_100_LINK || '',
  video_credits_500: import.meta.env.VITE_STRIPE_VIDEO_CREDITS_500_LINK || '',
  // Universal Credit Packs
  universal_credits_100: import.meta.env.VITE_STRIPE_UNIVERSAL_CREDITS_100_LINK || '',
  universal_credits_500: import.meta.env.VITE_STRIPE_UNIVERSAL_CREDITS_500_LINK || '',
  universal_credits_1000: import.meta.env.VITE_STRIPE_UNIVERSAL_CREDITS_1000_LINK || '',
  universal_credits_2500: import.meta.env.VITE_STRIPE_UNIVERSAL_CREDITS_2500_LINK || '',
}

// Redirect to Stripe Payment Link
export async function redirectToCheckout(priceId: string, userEmail?: string): Promise<void> {
  const paymentLink = PAYMENT_LINKS[priceId]

  if (!paymentLink) {
    const setupUrl = 'https://dashboard.stripe.com/products'
    throw new Error(
      `Payment niet geconfigureerd. Maak Payment Links aan in je Stripe Dashboard:\n\n` +
      `1. Ga naar ${setupUrl}\n` +
      `2. Maak het product aan\n` +
      `3. Klik op "Create payment link"\n` +
      `4. Voeg de URL toe aan je .env bestand`
    )
  }

  const url = new URL(paymentLink)
  if (userEmail) {
    url.searchParams.set('prefilled_email', userEmail)
  }

  window.location.href = url.toString()
}

// Helper to buy voice credits
export async function buyVoiceCredits(packType: VoiceCreditPackType, userEmail?: string): Promise<void> {
  const pack = VOICE_CREDIT_PACKS[packType]
  await redirectToCheckout(pack.priceId, userEmail)
}

// Helper to buy video credits
export async function buyVideoCredits(packType: VideoCreditPackType, userEmail?: string): Promise<void> {
  const pack = VIDEO_CREDIT_PACKS[packType]
  await redirectToCheckout(pack.priceId, userEmail)
}

// Helper to buy universal credits
export async function buyUniversalCredits(packType: UniversalCreditPackType, userEmail?: string): Promise<void> {
  const pack = UNIVERSAL_CREDIT_PACKS[packType]
  await redirectToCheckout(pack.priceId, userEmail)
}

export function getStripeSetupInstructions(): string {
  return `
## Stripe Payment Links Setup

Je Stripe API key is geconfigureerd! Nu moet je Payment Links aanmaken:

### Stap 1: Maak subscription producten aan
Ga naar: https://dashboard.stripe.com/products

**Subscriptions (recurring):**
- Starter Monthly: $9.99/month
- Starter Yearly: $99/year
- Pro Monthly: $24.99/month
- Pro Yearly: $249/year
- Premium Monthly: $49.99/month
- Premium Yearly: $499/year

**Voice Credit Packs (one-time):**
- 50 Voice Credits (25 minutes): $5.99
- 100 Voice Credits (50 minutes): $9.99
- 500 Voice Credits (250 minutes): $39.99

**Video Credit Packs (one-time):**
- 50 Video Credits (10 minutes): $19.99
- 100 Video Credits (20 minutes): $34.99
- 500 Video Credits (100 minutes): $149.99

### Stap 2: Maak Payment Links
Voor elk product:
1. Klik op het product
2. Klik op "Create payment link"
3. Stel "After payment" redirect in naar: ${typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'}/dashboard?payment=success

### Stap 3: Voeg toe aan .env
\`\`\`
# Subscriptions
VITE_STRIPE_STARTER_MONTHLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_STARTER_YEARLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_PRO_MONTHLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_PRO_YEARLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_PREMIUM_MONTHLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_PREMIUM_YEARLY_LINK=https://buy.stripe.com/xxx

# Voice Credit Packs
VITE_STRIPE_VOICE_CREDITS_50_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_VOICE_CREDITS_100_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_VOICE_CREDITS_500_LINK=https://buy.stripe.com/xxx

# Video Credit Packs
VITE_STRIPE_VIDEO_CREDITS_50_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_VIDEO_CREDITS_100_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_VIDEO_CREDITS_500_LINK=https://buy.stripe.com/xxx
\`\`\`

### Stap 4: Herstart de dev server
\`\`\`bash
npm run dev
\`\`\`
`
}
