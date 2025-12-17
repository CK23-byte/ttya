/**
import { logger } from '../utils/logger'
 * Payment Context
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Manages subscription status and payment state
import { logger } from '../utils/logger'
 * Stores subscription info encrypted in localStorage
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { logger } from '../utils/logger'
import { useAuth } from './AuthContext'
import { getSecure, setSecure } from '../utils/secureStorage'

type SubscriptionPlan = 'free' | 'pro' | 'lifetime'

interface SubscriptionStatus {
  plan: SubscriptionPlan
  isActive: boolean
  profileLimit: number
  messageLimit: number | null // null = unlimited
  expiresAt: number | null // timestamp, null for lifetime
  createdAt: number
}

interface PaymentContextType {
  subscription: SubscriptionStatus | null
  isLoading: boolean
  canCreateProfile: () => boolean
  canSendMessage: () => boolean
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>
  getRemainingProfiles: () => number
  getRemainingMessages: () => number | null
}

const PaymentContext = createContext<PaymentContextType | null>(null)

const SUBSCRIPTION_STORAGE_KEY = 'subscription_status'

// Default free plan
const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  plan: 'free',
  isActive: true,
  profileLimit: 1,
  messageLimit: 100,
  expiresAt: null,
  createdAt: Date.now()
}

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { encryptionKey } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load subscription status on mount
  useEffect(() => {
    const loadSubscription = async () => {
      if (!encryptionKey) {
        setIsLoading(false)
        return
      }

      try {
        const saved = await getSecure<SubscriptionStatus>(
          SUBSCRIPTION_STORAGE_KEY,
          encryptionKey
        )

        if (saved) {
          // Check if subscription is expired
          if (saved.expiresAt && saved.expiresAt < Date.now()) {
            // Expired - revert to free plan
            const freePlan = { ...DEFAULT_SUBSCRIPTION, createdAt: Date.now() }
            await setSecure(SUBSCRIPTION_STORAGE_KEY, freePlan, encryptionKey)
            setSubscription(freePlan)
          } else {
            setSubscription(saved)
          }
        } else {
          // No subscription found - set default free plan
          await setSecure(SUBSCRIPTION_STORAGE_KEY, DEFAULT_SUBSCRIPTION, encryptionKey)
          setSubscription(DEFAULT_SUBSCRIPTION)
        }
      } catch (error) {
        logger.error('Error loading subscription:', error)
        setSubscription(DEFAULT_SUBSCRIPTION)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [encryptionKey])

  const updateSubscription = async (plan: SubscriptionPlan) => {
    if (!encryptionKey) return

    let newSubscription: SubscriptionStatus

    switch (plan) {
      case 'free':
        newSubscription = {
          plan: 'free',
          isActive: true,
          profileLimit: 1,
          messageLimit: 100,
          expiresAt: null,
          createdAt: Date.now()
        }
        break

      case 'pro':
        // Pro plan - monthly subscription
        // In production, this would be set after successful payment
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        newSubscription = {
          plan: 'pro',
          isActive: true,
          profileLimit: 999, // Effectively unlimited
          messageLimit: null, // Unlimited
          expiresAt,
          createdAt: Date.now()
        }
        break

      case 'lifetime':
        newSubscription = {
          plan: 'lifetime',
          isActive: true,
          profileLimit: 999, // Effectively unlimited
          messageLimit: null, // Unlimited
          expiresAt: null, // Never expires
          createdAt: Date.now()
        }
        break
    }

    try {
      await setSecure(SUBSCRIPTION_STORAGE_KEY, newSubscription, encryptionKey)
      setSubscription(newSubscription)
    } catch (error) {
      logger.error('Error updating subscription:', error)
      throw error
    }
  }

  const canCreateProfile = (): boolean => {
    if (!subscription) return false
    // This would check actual profile count vs limit
    // For now, just check if limit is set
    return subscription.isActive
  }

  const canSendMessage = (): boolean => {
    if (!subscription) return false
    // This would check actual message count vs limit
    // For now, just check if subscription is active
    return subscription.isActive
  }

  const getRemainingProfiles = (): number => {
    if (!subscription) return 0
    // In production, this would fetch actual profile count
    // and return (profileLimit - currentCount)
    return subscription.profileLimit
  }

  const getRemainingMessages = (): number | null => {
    if (!subscription) return 0
    // null means unlimited
    if (subscription.messageLimit === null) return null
    // In production, this would track actual usage
    return subscription.messageLimit
  }

  return (
    <PaymentContext.Provider
      value={{
        subscription,
        isLoading,
        canCreateProfile,
        canSendMessage,
        updateSubscription,
        getRemainingProfiles,
        getRemainingMessages
      }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider')
  }
  return context
}
