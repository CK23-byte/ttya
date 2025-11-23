/**
 * Supabase Authentication Context
 *
 * Manages email-based authentication with Supabase
 * Handles user sessions, profiles, and credits
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Profile, CREDIT_PRICING } from '../types/database'

interface SupabaseAuthContextType {
  // Auth state
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isConfigured: boolean

  // Credits
  credits: number
  refreshCredits: () => Promise<void>

  // Auth methods
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const isConfigured = isSupabaseConfigured()

  // Pages where we should NOT auto-redirect after sign in
  const noRedirectPaths = ['/reset-password']

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)

          // Redirect to dashboard on sign in or email confirmation
          // But not if we're on certain pages like password reset
          if (
            (event === 'SIGNED_IN' || event === 'USER_UPDATED') &&
            !noRedirectPaths.includes(location.pathname)
          ) {
            // Check if we're on homepage or auth pages, then redirect to dashboard
            const authPaths = ['/', '/auth', '/email-auth', '/login', '/setup']
            if (authPaths.includes(location.pathname)) {
              navigate('/dashboard')
            }
          }
        } else {
          setProfile(null)
          setCredits(0)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [isConfigured, navigate, location.pathname])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Profile doesn't exist yet - will be created on signup
        console.log('Profile not found, might be new user')
        setProfile(null)
        setCredits(0)
      } else if (data) {
        setProfile(data as Profile)
        setCredits((data as Profile).credits)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh credits from database
  const refreshCredits = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setCredits((data as { credits: number }).credits)
    }
  }

  // Sign up with email
  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (!error && data.user) {
      // Create profile with signup bonus credits
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: displayName || null,
          credits: CREDIT_PRICING.SIGNUP_BONUS,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      } else {
        // Record the signup bonus as a transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: data.user.id,
            amount: CREDIT_PRICING.SIGNUP_BONUS,
            type: 'bonus',
            description: 'Welkomstbonus bij registratie',
          })
      }
    }

    return { error }
  }

  // Sign in with email
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setCredits(0)
  }

  // Reset password
  const resetPassword = async (
    email: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error }
  }

  // Update password
  const updatePassword = async (
    newPassword: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    return { error }
  }

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        credits,
        refreshCredits,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return context
}
