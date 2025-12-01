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

// Subscription Plans Configuration - Text Chat Only
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    description: 'Try it out',
    features: [
      '50 messages total',
      '1 AI Personality',
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
    features: [
      '1,500 messages per month',
      '3 AI Personalities',
      'All chat themes',
      'Priority text generation',
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
    features: [
      '6,000 messages per month',
      '10 AI Personalities',
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
    features: [
      '20,000 messages per month',
      'Unlimited AI Personalities',
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
// 1 voice credit = 1 minute of voice call
export const VOICE_CREDIT_PACKS = {
  small: {
    name: '50 Voice Credits',
    credits: 50,
    price: 4.99,
    pricePerCredit: 0.10,
    priceId: 'voice_credits_50',
  },
  medium: {
    name: '100 Voice Credits',
    credits: 100,
    price: 8.99,
    pricePerCredit: 0.09,
    popular: true,
    priceId: 'voice_credits_100',
  },
  large: {
    name: '500 Voice Credits',
    credits: 500,
    price: 39.99,
    pricePerCredit: 0.08,
    bestValue: true,
    priceId: 'voice_credits_500',
  },
} as const

// Video Credits (separate from text subscriptions and voice credits)
// 1 video credit = 1 minute of video call
export const VIDEO_CREDIT_PACKS = {
  small: {
    name: '50 Video Credits',
    credits: 50,
    price: 4.99,
    pricePerCredit: 0.10,
    priceId: 'video_credits_50',
  },
  medium: {
    name: '100 Video Credits',
    credits: 100,
    price: 8.99,
    pricePerCredit: 0.09,
    popular: true,
    priceId: 'video_credits_100',
  },
  large: {
    name: '500 Video Credits',
    credits: 500,
    price: 39.99,
    pricePerCredit: 0.08,
    bestValue: true,
    priceId: 'video_credits_500',
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS
export type VoiceCreditPackType = keyof typeof VOICE_CREDIT_PACKS
export type VideoCreditPackType = keyof typeof VIDEO_CREDIT_PACKS
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

export function getStripeSetupInstructions(): string {
  return `
## Stripe Payment Links Setup

Je Stripe API key is geconfigureerd! Nu moet je Payment Links aanmaken:

### Stap 1: Maak subscription producten aan
Ga naar: https://dashboard.stripe.com/products

**Subscriptions (recurring):**
- Starter Monthly: €9.99/maand
- Starter Yearly: €99/jaar
- Pro Monthly: €24.99/maand
- Pro Yearly: €249/jaar
- Premium Monthly: €49.99/maand
- Premium Yearly: €499/jaar

**Voice Credit Packs (one-time):**
- 50 Voice Credits: €4.99
- 100 Voice Credits: €8.99
- 500 Voice Credits: €39.99

**Video Credit Packs (one-time):**
- 50 Video Credits: €4.99
- 100 Video Credits: €8.99
- 500 Video Credits: €39.99

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
