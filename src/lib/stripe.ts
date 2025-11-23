/**
 * Stripe Configuration
 *
 * Handles Stripe integration for subscription payments
 * Uses Stripe Payment Links for client-side only checkout (no backend needed)
 */

// Stripe publishable key from environment (for future use with Stripe Elements)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

export function isStripeConfigured(): boolean {
  return !!STRIPE_PUBLISHABLE_KEY
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
      priceId: 'starter_monthly', // Used as identifier
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
  // Map priceId to payment link key
  const paymentLink = PAYMENT_LINKS[priceId]

  if (!paymentLink) {
    throw new Error(
      'Payment link not configured. Please create a Payment Link in your Stripe Dashboard and add it to your environment variables.'
    )
  }

  // Build the URL with optional prefilled email
  const url = new URL(paymentLink)
  if (userEmail) {
    url.searchParams.set('prefilled_email', userEmail)
  }

  // Add success/cancel URLs via client_reference_id if needed
  // url.searchParams.set('client_reference_id', 'user_id_here')

  // Redirect to Stripe Payment Link
  window.location.href = url.toString()
}

/**
 * How to set up Stripe Payment Links:
 *
 * 1. Go to Stripe Dashboard (https://dashboard.stripe.com)
 * 2. Go to Products > Create Product
 *    - Create "Starter Monthly" product: $9.99/month recurring
 *    - Create "Starter Yearly" product: $99/year recurring
 *    - Create "Pro Monthly" product: $19.99/month recurring
 *    - Create "Pro Yearly" product: $199/year recurring
 *
 * 3. For each product, click "Create payment link"
 *    - Enable "Collect customers' addresses" if needed
 *    - Set "After payment" to redirect to your success URL
 *
 * 4. Copy each payment link URL and add to your .env:
 *    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
 *    VITE_STRIPE_STARTER_MONTHLY_LINK=https://buy.stripe.com/xxx
 *    VITE_STRIPE_STARTER_YEARLY_LINK=https://buy.stripe.com/xxx
 *    VITE_STRIPE_PRO_MONTHLY_LINK=https://buy.stripe.com/xxx
 *    VITE_STRIPE_PRO_YEARLY_LINK=https://buy.stripe.com/xxx
 *
 * 5. Set up webhooks to sync subscription status (optional but recommended)
 */
