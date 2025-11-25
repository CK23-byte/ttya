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

// Voice & Video Credit Packs (separate from text subscriptions)
// 1 credit = 1 minute of voice call OR 1 minute of video call
export const CREDIT_PACKS = {
  small: {
    name: '50 Credits',
    credits: 50,
    price: 4.99,
    pricePerCredit: 0.10,
    priceId: 'credits_50',
  },
  medium: {
    name: '100 Credits',
    credits: 100,
    price: 8.99,
    pricePerCredit: 0.09,
    popular: true,
    priceId: 'credits_100',
  },
  large: {
    name: '500 Credits',
    credits: 500,
    price: 39.99,
    pricePerCredit: 0.08,
    bestValue: true,
    priceId: 'credits_500',
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS
export type CreditPackType = keyof typeof CREDIT_PACKS
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
  // Credit Packs
  credits_50: import.meta.env.VITE_STRIPE_CREDITS_50_LINK || '',
  credits_100: import.meta.env.VITE_STRIPE_CREDITS_100_LINK || '',
  credits_500: import.meta.env.VITE_STRIPE_CREDITS_500_LINK || '',
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

// Helper to buy credits
export async function buyCredits(packType: CreditPackType, userEmail?: string): Promise<void> {
  const pack = CREDIT_PACKS[packType]
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

**Credit Packs (one-time):**
- 50 Credits: €4.99
- 100 Credits: €8.99
- 500 Credits: €39.99

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

# Credit Packs
VITE_STRIPE_CREDITS_50_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_CREDITS_100_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_CREDITS_500_LINK=https://buy.stripe.com/xxx
\`\`\`

### Stap 4: Herstart de dev server
\`\`\`bash
npm run dev
\`\`\`
`
}
