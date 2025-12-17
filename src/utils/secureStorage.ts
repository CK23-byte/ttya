/**
import { logger } from '../utils/logger'
 * Secure Storage Utility
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Wrapper for localStorage that automatically encrypts/decrypts data
import { logger } from '../utils/logger'
 * All data stored using this utility is encrypted with AES-GCM
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
import { encrypt, decrypt } from './encryption'
import { logger } from '../utils/logger'

const STORAGE_PREFIX = 'ttya_secure_'
const METADATA_KEY = 'ttya_metadata'

interface StorageMetadata {
  version: string
  createdAt: number
  encryptedKeys: string[]
}

/**
 * Initialize secure storage metadata
 */
export function initializeStorage(): void {
  const existing = localStorage.getItem(METADATA_KEY)
  if (!existing) {
    const metadata: StorageMetadata = {
      version: '1.0.0',
      createdAt: Date.now(),
      encryptedKeys: [],
    }
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
  }
}

/**
 * Store encrypted data in localStorage
 * @param key - Storage key
 * @param value - Data to encrypt and store
 * @param encryptionKey - CryptoKey for encryption
 */
export async function setSecure(
  key: string,
  value: any,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value)
    const encrypted = await encrypt(jsonValue, encryptionKey)

    const storageKey = STORAGE_PREFIX + key
    localStorage.setItem(storageKey, encrypted)

    // Update metadata
    updateMetadata(key, 'add')
  } catch (error) {
    logger.error('Error storing secure data:', error)
    throw new Error('Failed to store encrypted data')
  }
}

/**
 * Retrieve and decrypt data from localStorage
 * @param key - Storage key
 * @param encryptionKey - CryptoKey for decryption
 * @returns Decrypted data or null if not found
 */
export async function getSecure<T = any>(
  key: string,
  encryptionKey: CryptoKey
): Promise<T | null> {
  try {
    const storageKey = STORAGE_PREFIX + key
    const encrypted = localStorage.getItem(storageKey)

    if (!encrypted) {
      return null
    }

    const decrypted = await decrypt(encrypted, encryptionKey)
    return JSON.parse(decrypted) as T
  } catch (error) {
    logger.error('Error retrieving secure data:', error)
    return null
  }
}

/**
 * Remove encrypted data from localStorage
 * @param key - Storage key
 */
export function removeSecure(key: string): void {
  const storageKey = STORAGE_PREFIX + key
  localStorage.removeItem(storageKey)
  updateMetadata(key, 'remove')
}

/**
 * Clear all encrypted data
 */
export function clearAllSecure(): void {
  const metadata = getMetadata()
  if (metadata) {
    metadata.encryptedKeys.forEach((key) => {
      const storageKey = STORAGE_PREFIX + key
      localStorage.removeItem(storageKey)
    })
  }
  localStorage.removeItem(METADATA_KEY)
}

/**
 * Check if a key exists in secure storage
 */
export function hasSecure(key: string): boolean {
  const storageKey = STORAGE_PREFIX + key
  return localStorage.getItem(storageKey) !== null
}

/**
 * Get all encrypted keys
 */
export function getSecureKeys(): string[] {
  const metadata = getMetadata()
  return metadata?.encryptedKeys || []
}

/**
 * Update storage metadata
 */
function updateMetadata(key: string, action: 'add' | 'remove'): void {
  const metadata = getMetadata()
  if (!metadata) return

  if (action === 'add') {
    if (!metadata.encryptedKeys.includes(key)) {
      metadata.encryptedKeys.push(key)
    }
  } else {
    metadata.encryptedKeys = metadata.encryptedKeys.filter((k) => k !== key)
  }

  localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
}

/**
 * Get storage metadata
 */
function getMetadata(): StorageMetadata | null {
  const metadataStr = localStorage.getItem(METADATA_KEY)
  if (!metadataStr) return null

  try {
    return JSON.parse(metadataStr) as StorageMetadata
  } catch {
    return null
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  encryptedKeys: number
  totalSize: number
} {
  const metadata = getMetadata()
  let totalSize = 0

  if (metadata) {
    metadata.encryptedKeys.forEach((key) => {
      const storageKey = STORAGE_PREFIX + key
      const item = localStorage.getItem(storageKey)
      if (item) {
        totalSize += item.length
      }
    })
  }

  return {
    encryptedKeys: metadata?.encryptedKeys.length || 0,
    totalSize,
  }
}
