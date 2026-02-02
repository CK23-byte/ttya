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

// Subscription Plans Configuration - Text Chat with Voice Minutes
// Based on cost analysis:
// - Text: ~$0.0135/msg cost → $0.04/msg price (300% margin)
// - Voice: ~$0.30/min cost → $1.00/min price (300% margin)
// - 1 voice minute = 25 text messages in value
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
      '250 messages OR 10 voice minutes/month',
      '3 AI Personalities',
      'All chat themes',
      'Upload up to 3 chat archives',
      'Mix text & voice freely',
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
      '625 messages OR 25 voice minutes/month',
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
      '1,250 messages OR 50 voice minutes/month',
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

// Universal Credits (can be used for text AND voice)
// 1 credit = 1 text message
// 25 credits = 1 voice minute
export const UNIVERSAL_CREDIT_PACKS = {
  small: {
    name: '100 Universal Credits',
    credits: 100,
    price: 9.99,
    pricePerCredit: 0.10,
    description: '100 messages OR 4 voice minutes',
    priceId: 'universal_credits_100',
    popular: false,
    bestValue: false,
  },
  medium: {
    name: '500 Universal Credits',
    credits: 500,
    price: 39.99,
    pricePerCredit: 0.08,
    popular: true,
    bestValue: false,
    description: '500 messages OR 20 voice minutes',
    priceId: 'universal_credits_500',
  },
  large: {
    name: '1,000 Universal Credits',
    credits: 1000,
    price: 69.99,
    pricePerCredit: 0.07,
    popular: false,
    bestValue: true,
    description: '1,000 messages OR 40 voice minutes',
    priceId: 'universal_credits_1000',
  },
  xlarge: {
    name: '2,500 Universal Credits',
    credits: 2500,
    price: 149.99,
    pricePerCredit: 0.06,
    description: '2,500 messages OR 100 voice minutes',
    priceId: 'universal_credits_2500',
    popular: false,
    bestValue: false,
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS
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
- Starter Monthly: $9.99/month (250 messages OR 10 voice minutes)
- Starter Yearly: $99/year
- Pro Monthly: $24.99/month (625 messages OR 25 voice minutes)
- Pro Yearly: $249/year
- Premium Monthly: $49.99/month (1,250 messages OR 50 voice minutes)
- Premium Yearly: $499/year

**Universal Credit Packs (one-time):**
- 100 Credits: $9.99 (100 messages OR 4 voice minutes)
- 500 Credits: $39.99 (500 messages OR 20 voice minutes)
- 1,000 Credits: $69.99 (1,000 messages OR 40 voice minutes)
- 2,500 Credits: $149.99 (2,500 messages OR 100 voice minutes)

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

# Universal Credit Packs
VITE_STRIPE_UNIVERSAL_CREDITS_100_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_UNIVERSAL_CREDITS_500_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_UNIVERSAL_CREDITS_1000_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_UNIVERSAL_CREDITS_2500_LINK=https://buy.stripe.com/xxx
\`\`\`

### Stap 4: Herstart de dev server
\`\`\`bash
npm run dev
\`\`\`
`
}
