/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for automatic credit provisioning
 * Triggered when a customer completes a payment via Stripe Checkout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any, // Suppress version type checking
})

// Initialize Supabase with service role key (has admin permissions)
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Disable body parsing to get raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to read raw body
async function getRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check environment variables
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe configuration')
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase configuration')
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  let event: Stripe.Event

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req)
    const sig = req.headers['stripe-signature'] as string

    if (!sig) {
      console.error('Missing stripe-signature header')
      return res.status(400).json({ error: 'Missing signature' })
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return res.status(400).json({ error: `Webhook verification failed: ${error.message}` })
  }

  console.log(`📥 Received webhook event: ${event.type}`)

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Extract customer email
      const customerEmail = session.customer_details?.email

      if (!customerEmail) {
        throw new Error('No customer email in checkout session')
      }

      console.log(`👤 Processing payment for: ${customerEmail}`)

      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, voice_credits, video_credits, email')
        .eq('email', customerEmail)
        .single()

      if (profileError || !profile) {
        console.error('Profile lookup error:', profileError)
        throw new Error(`User profile not found for email: ${customerEmail}`)
      }

      console.log(`✅ Found user profile: ${profile.id}`)

      // Parse metadata from checkout session
      const metadata = session.metadata || {}
      const creditType = metadata.credit_type as 'voice' | 'video' | undefined
      const creditAmount = parseInt(metadata.credit_amount || '0')

      if (!creditType || !creditAmount || isNaN(creditAmount)) {
        console.error('Invalid metadata:', metadata)
        throw new Error('Missing or invalid metadata (credit_type, credit_amount)')
      }

      console.log(`💳 Adding ${creditAmount} ${creditType} credits`)

      // Calculate new credit balance
      const currentCredits = creditType === 'voice'
        ? profile.voice_credits
        : profile.video_credits

      const newCredits = currentCredits + creditAmount

      // Update user credits
      const updates = creditType === 'voice'
        ? { voice_credits: newCredits }
        : { video_credits: newCredits }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)

      if (updateError) {
        console.error('Credit update error:', updateError)
        throw new Error('Failed to update credits')
      }

      console.log(`✅ Updated ${creditType} credits: ${currentCredits} → ${newCredits}`)

      // Log transaction in credit_transactions table
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: profile.id,
          amount: creditAmount,
          type: 'purchase',
          credit_type: creditType,
          description: `Purchased ${creditAmount} ${creditType} credits via Stripe`,
          stripe_payment_id: session.payment_intent as string,
        })

      if (transactionError) {
        console.error('Transaction logging error:', transactionError)
        // Don't throw - credits were already added, just log the error
      } else {
        console.log(`📝 Logged transaction for ${creditAmount} ${creditType} credits`)
      }

      console.log(`🎉 Successfully processed payment for ${customerEmail}`)

      // Return success
      return res.status(200).json({
        received: true,
        user_id: profile.id,
        credits_added: creditAmount,
        credit_type: creditType,
        new_balance: newCredits,
      })

    } catch (error) {
      const err = error as Error
      console.error('❌ Error processing payment:', err.message)
      console.error('Stack trace:', err.stack)

      // Return 500 so Stripe retries the webhook
      return res.status(500).json({
        error: 'Failed to process payment',
        message: err.message,
      })
    }
  }

  // Handle payment_intent.succeeded (backup event)
  if (event.type === 'payment_intent.succeeded') {
    console.log('💰 Payment intent succeeded (handled via checkout.session.completed)')
  }

  // Handle payment_intent.payment_failed
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log(`❌ Payment failed: ${paymentIntent.id}`)
    // Could send email notification to user here
  }

  // Return 200 for all events
  return res.status(200).json({ received: true })
}
