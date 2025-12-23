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
import { logger } from '../utils/logger'

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
  refreshProfile: () => Promise<void>

  // Auth methods
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: AuthError | null }>
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
      logger.log('Supabase not configured, skipping auth initialization')
      setIsLoading(false)
      return
    }

    logger.log('Initializing auth state')

    // Set a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      logger.warn('Auth initialization timeout - forcing isLoading to false')
      setIsLoading(false)
    }, 5000) // 5 seconds timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.log('Initial session:', session ? 'Found' : 'None')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setIsLoading(false)
          clearTimeout(safetyTimeout)
        })
      } else {
        setIsLoading(false)
        clearTimeout(safetyTimeout)
      }
    }).catch((err) => {
      logger.error('Error getting initial session:', err)
      setIsLoading(false)
      clearTimeout(safetyTimeout)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        logger.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session')
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
          setIsLoading(false) // Ensure loading state is cleared after profile fetch

          // Redirect logic based on auth event
          if (!noRedirectPaths.includes(location.pathname)) {
            if (event === 'SIGNED_IN') {
              // Regular sign in → go to dashboard
              logger.log('✅ User signed in, redirecting to dashboard')
              navigate('/dashboard')
            } else if (event === 'USER_UPDATED') {
              // Email verification or profile update → sign out and go to login
              logger.log('✅ Email verified, signing out and redirecting to login')
              // Sign out so user must explicitly log in
              await supabase.auth.signOut()
              // Show success message
              navigate('/email-auth', {
                state: { message: 'Email verified! You can now log in with your account.' }
              })
            }
          }
        } else {
          setProfile(null)
          setCredits(0)
          setIsLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [isConfigured, navigate, location.pathname])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      logger.log('📋 Fetching profile for user:', userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // Profile doesn't exist - create it automatically for new users
        logger.warn('Profile not found, creating new profile for user:', userId)

        // Get user email from session
        const { data: { session } } = await supabase.auth.getSession()
        const userEmail = session?.user?.email

        if (userEmail) {
          // Create profile with signup bonus - don't use .single() to avoid 406 errors
          const { data: insertedProfiles, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail,
              display_name: null,
              credits: CREDIT_PRICING.SIGNUP_BONUS,
            })
            .select()

          if (createError) {
            logger.error('Error creating profile:', createError)
            // Profile might already exist, try to fetch it
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle()

            if (existingProfile) {
              logger.log('✅ Using existing profile:', existingProfile)
              setProfile(existingProfile as Profile)
              setCredits((existingProfile as Profile).credits)
            } else {
              setProfile(null)
              setCredits(0)
            }
          } else if (insertedProfiles && insertedProfiles.length > 0) {
            const newProfile = insertedProfiles[0]
            logger.log('✅ Profile created successfully:', newProfile)
            setProfile(newProfile as Profile)
            setCredits(CREDIT_PRICING.SIGNUP_BONUS)

            // Also create signup bonus transaction
            await supabase.from('credit_transactions').insert({
              user_id: userId,
              amount: CREDIT_PRICING.SIGNUP_BONUS,
              type: 'bonus' as const,
              credit_type: 'general' as const,
              description: 'Welcome bonus - universal credits on registration',
            })
          }
        } else {
          logger.error('Cannot create profile: no email found')
          setProfile(null)
          setCredits(0)
        }
      } else if (data) {
        logger.log('✅ Profile loaded successfully:', data)
        setProfile(data as Profile)
        setCredits((data as Profile).credits)
      } else {
        // No data and no error - shouldn't happen but handle it
        logger.warn('No profile data and no error returned')
        setProfile(null)
        setCredits(0)
      }
    } catch (err) {
      logger.error('Exception while fetching profile:', err)
      setProfile(null)
      setCredits(0)
    } finally {
      logger.log('Setting isLoading to false')
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
      .maybeSingle()

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
      // Create profile with signup bonus universal credits
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: displayName || null,
          credits: CREDIT_PRICING.SIGNUP_BONUS,
        })

      if (profileError) {
        logger.error('Error creating profile:', profileError)
      } else {
        // Record the signup bonus transaction
        await supabase.from('credit_transactions').insert({
          user_id: data.user.id,
          amount: CREDIT_PRICING.SIGNUP_BONUS,
          type: 'bonus' as const,
          credit_type: 'general' as const,
          description: 'Welcome bonus - universal credits on registration',
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

    logger.log('Attempting sign in for:', email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('Sign in error:', error)
      } else {
        logger.log('Sign in successful:', data.user?.id)
      }

      return { error }
    } catch (err) {
      logger.error('Exception during sign in:', err)
      return { error: { message: 'An error occurred while logging in' } as AuthError }
    }
  }

  // Sign in with OAuth (Google, Apple)
  const signInWithOAuth = async (
    provider: 'google' | 'apple'
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
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

  // Refresh profile from database
  const refreshProfile = async () => {
    if (!user) return
    await fetchProfile(user.id)
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
        refreshProfile,
        signUp,
        signIn,
        signInWithOAuth,
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
