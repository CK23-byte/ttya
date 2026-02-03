/**
 * Supabase Database Types
 *
 * Type definitions for the database schema
 * Used for type-safe database queries
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          credits: number
          text_credits: number
          voice_credits: number
          profile_limit: number | null // Custom profile limit (null = use default)
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          credits?: number
          text_credits?: number
          voice_credits?: number
          profile_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          credits?: number
          text_credits?: number
          voice_credits?: number
          profile_limit?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage' | 'bonus' | 'refund'
          credit_type: 'general' | 'text' | 'voice'
          description: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage' | 'bonus' | 'refund'
          credit_type?: 'general' | 'text' | 'voice'
          description?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'usage' | 'bonus' | 'refund'
          credit_type?: 'general' | 'text' | 'voice'
          description?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
      api_usage: {
        Row: {
          id: string
          user_id: string
          tokens_used: number
          model: string
          cost_credits: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tokens_used: number
          model: string
          cost_credits: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tokens_used?: number
          model?: string
          cost_credits?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']
export type ApiUsage = Database['public']['Tables']['api_usage']['Row']

// Credit package type
export interface CreditPackage {
  credits: number
  price: number
  id: string
  popular?: boolean
}

// Credit pricing (in credits)
// Based on 300% margin target:
// - Text: ~$0.0135/msg cost → $0.04/msg price
// - Voice: ~$0.30/min cost → $1.00/min price
export const CREDIT_PRICING = {
  // Text message costs based on token usage (approximate)
  MESSAGE_BASE_COST: 1, // 1 credit per message minimum
  TOKEN_COST_PER_1K: 0.5, // 0.5 credits per 1000 tokens

  // Voice call costs (per minute)
  // OpenAI Realtime: $0.06 input + $0.24 output = $0.30/min
  // With 300% margin: $1.00/min → 25 credits/min
  VOICE_COST_PER_MINUTE: 25, // 25 credits per minute (OpenAI Realtime API)

  // Credit conversion
  CREDITS_PER_VOICE_MINUTE: 25, // 1 voice minute = 25 text credits

  // Credit packages (USD)
  PACKAGES: [
    { credits: 100, price: 9.99, id: 'credits_100' },
    { credits: 500, price: 39.99, id: 'credits_500', popular: true },
    { credits: 1000, price: 69.99, id: 'credits_1000' },
    { credits: 2500, price: 149.99, id: 'credits_2500' },
  ] as CreditPackage[],

  // Bonus credits for new users
  SIGNUP_BONUS: 50, // Universal credits (50 messages or 2 voice minutes)
  SIGNUP_BONUS_TEXT: 50, // Text credits
  SIGNUP_BONUS_VOICE: 50, // Voice credits (same as text, can be used for 2 voice minutes)
}
