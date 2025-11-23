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

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    description: 'Perfect for getting started',
    features: [
      '1,000 messages per month',
      '5 AI personalities',
      'All chat themes',
      'Email support',
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
    description: 'For power users who want more',
    popular: true,
    features: [
      'Unlimited messages',
      'Unlimited AI personalities',
      'All chat themes',
      'Priority support',
      'Voice messages (coming soon)',
      'Video calls (coming soon)',
    ],
    monthly: {
      price: 19.99,
      priceId: 'pro_monthly',
    },
    yearly: {
      price: 199,
      priceId: 'pro_yearly',
      savings: '17%',
    },
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS
export type BillingPeriod = 'monthly' | 'yearly'

// Payment Links - Create these in Stripe Dashboard > Products > Payment Links
// Then add to your .env file
export const PAYMENT_LINKS: Record<string, string> = {
  starter_monthly: import.meta.env.VITE_STRIPE_STARTER_MONTHLY_LINK || '',
  starter_yearly: import.meta.env.VITE_STRIPE_STARTER_YEARLY_LINK || '',
  pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_LINK || '',
  pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_LINK || '',
}

// Redirect to Stripe Payment Link
export async function redirectToCheckout(priceId: string, userEmail?: string): Promise<void> {
  const paymentLink = PAYMENT_LINKS[priceId]

  if (!paymentLink) {
    // Provide helpful setup instructions
    const setupUrl = 'https://dashboard.stripe.com/products'
    throw new Error(
      `Payment niet geconfigureerd. Maak Payment Links aan in je Stripe Dashboard:\n\n` +
      `1. Ga naar ${setupUrl}\n` +
      `2. Maak producten aan (Starter €9.99/maand, Pro €19.99/maand)\n` +
      `3. Klik op "Create payment link" voor elk product\n` +
      `4. Voeg de URLs toe aan je .env bestand`
    )
  }

  // Build the URL with optional prefilled email
  const url = new URL(paymentLink)
  if (userEmail) {
    url.searchParams.set('prefilled_email', userEmail)
  }

  // Redirect to Stripe Payment Link
  window.location.href = url.toString()
}

// Create products in Stripe Dashboard using this helper
export function getStripeSetupInstructions(): string {
  return `
## Stripe Payment Links Setup

Je Stripe API key is geconfigureerd! Nu moet je Payment Links aanmaken:

### Stap 1: Maak producten aan
Ga naar: https://dashboard.stripe.com/products

Maak deze 4 producten aan:
- **Starter Monthly**: €9.99/maand (recurring)
- **Starter Yearly**: €99/jaar (recurring)
- **Pro Monthly**: €19.99/maand (recurring)
- **Pro Yearly**: €199/jaar (recurring)

### Stap 2: Maak Payment Links
Voor elk product:
1. Klik op het product
2. Klik op "Create payment link"
3. Stel de "After payment" redirect in naar: ${window.location.origin}/dashboard?payment=success
4. Kopieer de gegenereerde link (begint met https://buy.stripe.com/)

### Stap 3: Voeg toe aan .env
\`\`\`
VITE_STRIPE_STARTER_MONTHLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_STARTER_YEARLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_PRO_MONTHLY_LINK=https://buy.stripe.com/xxx
VITE_STRIPE_PRO_YEARLY_LINK=https://buy.stripe.com/xxx
\`\`\`

### Stap 4: Herstart de dev server
\`\`\`bash
npm run dev
\`\`\`
`
}
