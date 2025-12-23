/**
 * Personality Profile Storage Utilities
 *
 * Handles saving/loading personality profiles for both auth types:
 * - Encrypted localStorage for encrypted auth
 * - Supabase database for Supabase auth
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSecure, setSecure } from './secureStorage'
import { PersonalityProfile } from '../types'
import { logger } from './logger'

const PROFILES_STORAGE_KEY = 'personality_profiles'

/**
 * Load all personality profiles for current user
 */
export async function loadPersonalityProfiles(
  encryptionKey: CryptoKey | null
): Promise<PersonalityProfile[]> {
  try {
    if (encryptionKey) {
      // Encrypted auth: use secure localStorage
      const profiles = await getSecure<PersonalityProfile[]>(PROFILES_STORAGE_KEY, encryptionKey)
      return profiles || []
    } else if (isSupabaseConfigured()) {
      // Supabase auth: load from database
      const { data: session } = await supabase.auth.getSession()
      logger.log('🔍 Loading profiles - Session check:', {
        hasSession: !!session.session,
        userId: session.session?.user?.id
      })

      if (!session.session?.user) {
        logger.warn('No authenticated user, cannot load profiles from database')
        return []
      }

      logger.log('📡 Fetching profiles from database for user:', session.session.user.id)

      const { data, error } = await supabase
        .from('personality_profiles')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })

      logger.log('📦 Database response:', {
        rowCount: data?.length || 0,
        hasError: !!error,
        errorMessage: error?.message
      })

      if (error) {
        logger.error('Error loading profiles from Supabase:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
      }

      // Convert database format to PersonalityProfile format
      const profiles: PersonalityProfile[] = (data || []).map(row => {
        // Parse profile_data if it exists
        const profileData = row.profile_data || {}

        return {
          id: row.profile_id,
          name: row.name,
          relationship: row.relationship,
          // Use profile_data fields if available, otherwise use defaults
          typicalPhrases: profileData.typicalPhrases || [],
          hobbies: profileData.hobbies || [],
          habits: profileData.habits || [],
          humorStyle: profileData.humorStyle || 'Friendly and conversational',
          traits: profileData.traits || [],
          tone: profileData.tone || ('informal' as const),
          emojiUsage: profileData.emojiUsage || ('medium' as const),
          systemPrompt: profileData.systemPrompt || `You are ${row.name}, speaking in a natural, conversational way.`,
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
          // Optional fields from profile_data
          photoUrl: profileData.photoUrl,
          photoUrls: profileData.photoUrls,
          birthDate: profileData.birthDate,
          dateSince: profileData.dateSince
        }
      })

      logger.log('✅ Loaded profiles from Supabase:', {
        count: profiles.length,
        profiles: profiles.map(p => ({ id: p.id, name: p.name }))
      })
      return profiles
    } else {
      // Fallback: plain localStorage (not recommended)
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    }
  } catch (error) {
    logger.error('Error loading personality profiles:', error)
    return []
  }
}

/**
 * Save all personality profiles for current user
 */
export async function savePersonalityProfiles(
  profiles: PersonalityProfile[],
  encryptionKey: CryptoKey | null
): Promise<void> {
  try {
    if (encryptionKey) {
      // Encrypted auth: use secure localStorage
      await setSecure(PROFILES_STORAGE_KEY, profiles, encryptionKey)
      logger.log('Saved profiles to encrypted storage:', profiles.length)
    } else if (isSupabaseConfigured()) {
      // Supabase auth: save to database
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) {
        logger.warn('No authenticated user, cannot save profiles to database')
        return
      }

      // Delete existing profiles first
      await supabase
        .from('personality_profiles')
        .delete()
        .eq('user_id', session.session.user.id)

      // Insert new profiles
      if (profiles.length > 0) {
        const rows = profiles.map(profile => ({
          user_id: session.session.user.id,
          profile_id: profile.id,
          name: profile.name,
          relationship: profile.relationship,
          description: null, // Not storing description separately
          profile_data: {
            // Store all profile fields in JSONB column
            typicalPhrases: profile.typicalPhrases,
            hobbies: profile.hobbies,
            habits: profile.habits,
            humorStyle: profile.humorStyle,
            traits: profile.traits,
            tone: profile.tone,
            emojiUsage: profile.emojiUsage,
            systemPrompt: profile.systemPrompt,
            photoUrl: profile.photoUrl,
            photoUrls: profile.photoUrls,
            birthDate: profile.birthDate,
            dateSince: profile.dateSince
          }
        }))

        const { error } = await supabase
          .from('personality_profiles')
          .insert(rows)

        if (error) {
          logger.error('Error saving profiles to Supabase:', error)
          // Fallback to localStorage
          localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
        } else {
          logger.log('Saved profiles to Supabase:', profiles.length)
        }
      }
    } else {
      // Fallback: plain localStorage
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
      logger.log('Saved profiles to localStorage:', profiles.length)
    }
  } catch (error) {
    logger.error('Error saving personality profiles:', error)
    throw error
  }
}

/**
 * Load profile data (photos, videos, notes, etc.) for a specific profile
 */
export async function loadProfileData<T = any>(
  profileId: string,
  encryptionKey: CryptoKey | null
): Promise<T | null> {
  try {
    const key = `profile_data_${profileId}`

    if (encryptionKey) {
      // Encrypted auth: use secure localStorage
      return await getSecure<T>(key, encryptionKey)
    } else if (isSupabaseConfigured()) {
      // Supabase auth: load from database
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) {
        logger.warn('No authenticated user, cannot load profile data from database')
        return null
      }

      const { data, error } = await supabase
        .from('personality_profiles')
        .select('profile_data')
        .eq('user_id', session.session.user.id)
        .eq('profile_id', profileId)
        .single()

      if (error) {
        logger.error('Error loading profile data from Supabase:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem(key)
        return stored ? JSON.parse(stored) : null
      }

      return data?.profile_data as T
    } else {
      // Fallback: plain localStorage
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    }
  } catch (error) {
    logger.error('Error loading profile data:', error)
    return null
  }
}

/**
 * Save profile data (photos, videos, notes, etc.) for a specific profile
 */
export async function saveProfileData(
  profileId: string,
  data: any,
  encryptionKey: CryptoKey | null
): Promise<void> {
  try {
    const key = `profile_data_${profileId}`

    if (encryptionKey) {
      // Encrypted auth: use secure localStorage
      await setSecure(key, data, encryptionKey)
      logger.log('Saved profile data to encrypted storage:', profileId)
    } else if (isSupabaseConfigured()) {
      // Supabase auth: save to database
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) {
        logger.warn('No authenticated user, cannot save profile data to database')
        return
      }

      const { error } = await supabase
        .from('personality_profiles')
        .update({ profile_data: data })
        .eq('user_id', session.session.user.id)
        .eq('profile_id', profileId)

      if (error) {
        logger.error('Error saving profile data to Supabase:', error)
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(data))
      } else {
        logger.log('Saved profile data to Supabase:', profileId)
      }
    } else {
      // Fallback: plain localStorage
      localStorage.setItem(key, JSON.stringify(data))
      logger.log('Saved profile data to localStorage:', profileId)
    }
  } catch (error) {
    logger.error('Error saving profile data:', error)
    throw error
  }
}

/**
 * Delete a personality profile and all its data
 */
export async function deletePersonalityProfile(
  profileId: string,
  encryptionKey: CryptoKey | null
): Promise<void> {
  try {
    if (encryptionKey) {
      // Encrypted auth: delete from localStorage
      const profiles = await loadPersonalityProfiles(encryptionKey)
      const updated = profiles.filter(p => p.id !== profileId)
      await savePersonalityProfiles(updated, encryptionKey)

      // Delete profile data
      localStorage.removeItem(`profile_data_${profileId}`)
      localStorage.removeItem(`messages_${profileId}`)
    } else if (isSupabaseConfigured()) {
      // Supabase auth: delete from database
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) {
        logger.warn('No authenticated user, cannot delete profile from database')
        return
      }

      const { error } = await supabase
        .from('personality_profiles')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('profile_id', profileId)

      if (error) {
        logger.error('Error deleting profile from Supabase:', error)
      }

      // Also delete from localStorage (fallback data)
      localStorage.removeItem(`profile_data_${profileId}`)
      localStorage.removeItem(`messages_${profileId}`)
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
      if (stored) {
        const profiles: PersonalityProfile[] = JSON.parse(stored)
        const updated = profiles.filter(p => p.id !== profileId)
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated))
      }
    } else {
      // Fallback: delete from localStorage
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
      if (stored) {
        const profiles: PersonalityProfile[] = JSON.parse(stored)
        const updated = profiles.filter(p => p.id !== profileId)
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated))
      }

      localStorage.removeItem(`profile_data_${profileId}`)
      localStorage.removeItem(`messages_${profileId}`)
    }

    logger.log('Deleted personality profile:', profileId)
  } catch (error) {
    logger.error('Error deleting personality profile:', error)
    throw error
  }
}
