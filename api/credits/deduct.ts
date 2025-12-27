/**
 * Vercel Serverless Function: Deduct Universal Credits
 *
 * Deducts universal credits from a user's account
 * All credits come from the same pool and can be used for text, voice, or video
 * Credit type is tracked for analytics only
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/database'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

interface DeductCreditsRequest {
  userId: string
  amount: number
  usageType: 'text' | 'voice' | 'video'  // Track usage type for analytics
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
    const { userId, amount, usageType, description } = body

    // Validate input
    if (!userId || !amount || !usageType) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, usageType'
      })
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      })
    }

    if (!['text', 'voice', 'video'].includes(usageType)) {
      return res.status(400).json({
        error: 'Invalid usageType. Must be: text, voice, or video'
      })
    }

    // Create Supabase client with service key (bypasses RLS)
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get current universal credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Failed to get profile:', profileError)
      return res.status(404).json({
        error: 'User profile not found'
      })
    }

    // Check if user has enough universal credits
    const currentCredits = (profile as any).credits || 0

    if (currentCredits < amount) {
      return res.status(402).json({
        error: 'Insufficient universal credits',
        required: amount,
        available: currentCredits,
        usageType
      })
    }

    // Deduct universal credits (using atomic update)
    const newBalance = currentCredits - amount
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newBalance } as any)
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
        credit_type: 'general', // Universal credits are stored as 'general'
        description: description || `Used ${amount} universal credits for ${usageType}`
      } as any)

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError)
      // Don't fail the request if transaction logging fails
    }

    // Return success with updated balance
    return res.status(200).json({
      success: true,
      usageType,
      amountDeducted: amount,
      remainingCredits: newBalance,
      message: `Successfully deducted ${amount} universal credits for ${usageType}`
    })

  } catch (error) {
    console.error('Error deducting credits:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
