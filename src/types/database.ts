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
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          credits?: number
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
          description: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage' | 'bonus' | 'refund'
          description?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'usage' | 'bonus' | 'refund'
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
  // Message costs based on token usage (approximate)
  MESSAGE_BASE_COST: 1, // 1 credit per message minimum
  TOKEN_COST_PER_1K: 0.5, // 0.5 credits per 1000 tokens

  // Credit packages (EUR)
  PACKAGES: [
    { credits: 100, price: 5.00, id: 'credits_100' },
    { credits: 250, price: 10.00, id: 'credits_250', popular: true },
    { credits: 600, price: 20.00, id: 'credits_600' },
    { credits: 1500, price: 45.00, id: 'credits_1500' },
  ] as CreditPackage[],

  // Bonus credits for new users
  SIGNUP_BONUS: 10,
}
