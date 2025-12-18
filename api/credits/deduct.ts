/**
 * Vercel Serverless Function: Deduct Credits
 *
 * Deducts credits from a user's account based on credit type
 * Supports: text, voice, video credits
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/database'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

interface DeductCreditsRequest {
  userId: string
  amount: number
  creditType: 'text' | 'voice' | 'video'
  description?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check required environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase configuration missing')
    return res.status(500).json({
      error: 'Server configuration error'
    })
  }

  try {
    const body = req.body as DeductCreditsRequest
    const { userId, amount, creditType, description } = body

    // Validate input
    if (!userId || !amount || !creditType) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, creditType'
      })
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      })
    }

    if (!['text', 'voice', 'video'].includes(creditType)) {
      return res.status(400).json({
        error: 'Invalid creditType. Must be: text, voice, or video'
      })
    }

    // Create Supabase client with service key (bypasses RLS)
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get current credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('text_credits, voice_credits, video_credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Failed to get profile:', profileError)
      return res.status(404).json({
        error: 'User profile not found'
      })
    }

    // Check if user has enough credits
    const creditField = `${creditType}_credits` as keyof typeof profile
    const currentCredits = profile[creditField] as number

    if (currentCredits < amount) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: amount,
        available: currentCredits,
        creditType
      })
    }

    // Deduct credits (using atomic update)
    const updateField = `${creditType}_credits`
    const updateData: Record<string, number> = { [updateField]: currentCredits - amount }
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData as any)
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to deduct credits:', updateError)
      return res.status(500).json({
        error: 'Failed to deduct credits'
      })
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount, // Negative for usage
        type: 'usage' as const,
        credit_type: creditType,
        description: description || `Used ${amount} ${creditType} credits`
      } as any)

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError)
      // Don't fail the request if transaction logging fails
    }

    // Return success with updated balance
    const newBalance = currentCredits - amount

    return res.status(200).json({
      success: true,
      creditType,
      amountDeducted: amount,
      remainingCredits: newBalance,
      message: `Successfully deducted ${amount} ${creditType} credits`
    })

  } catch (error) {
    console.error('Error deducting credits:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
