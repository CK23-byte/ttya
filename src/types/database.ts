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
          video_credits: number
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
          video_credits?: number
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
          video_credits?: number
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
          credit_type: 'general' | 'text' | 'voice' | 'video'
          description: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage' | 'bonus' | 'refund'
          credit_type?: 'general' | 'text' | 'voice' | 'video'
          description?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'usage' | 'bonus' | 'refund'
          credit_type?: 'general' | 'text' | 'voice' | 'video'
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
export const CREDIT_PRICING = {
  // Text message costs based on token usage (approximate)
  MESSAGE_BASE_COST: 1, // 1 credit per message minimum
  TOKEN_COST_PER_1K: 0.5, // 0.5 credits per 1000 tokens

  // Voice call costs (per minute)
  VOICE_COST_PER_MINUTE: 6, // 6 credits per minute (1 credit = 10 seconds)

  // Video call costs (per minute)
  VIDEO_COST_PER_MINUTE: 12, // 12 credits per minute (1 credit = 5 seconds)

  // Credit packages (EUR)
  PACKAGES: [
    { credits: 100, price: 5.00, id: 'credits_100' },
    { credits: 250, price: 10.00, id: 'credits_250', popular: true },
    { credits: 600, price: 20.00, id: 'credits_600' },
    { credits: 1500, price: 45.00, id: 'credits_1500' },
  ] as CreditPackage[],

  // Bonus credits for new users (universal credits)
  SIGNUP_BONUS: 50, // Universal credits (50 text messages, ~8 min voice, or ~4 min video)
}
