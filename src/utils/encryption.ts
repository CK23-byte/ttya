/**
 * Encryption Utility
 *
 * Provides client-side encryption using Web Crypto API (AES-GCM 256-bit)
 * All sensitive data is encrypted before storage in localStorage
 * Master password is never stored - only used to derive encryption key
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM
const SALT_LENGTH = 16 // 128 bits
const ITERATIONS = parseInt(import.meta.env.VITE_ENCRYPTION_ITERATIONS || '100000')

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

/**
 * Generate a random initialization vector for encryption
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH))
}

/**
 * Derive an encryption key from a master password using PBKDF2
 * @param password - Master password (never stored)
 * @param salt - Salt for key derivation
 * @returns CryptoKey for encryption/decryption
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Convert password to bytes
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive encryption key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable
    ['encrypt', 'decrypt']
  )

  return key
}

/**
 * Encrypt data using AES-GCM
 * @param data - Data to encrypt (string)
 * @param key - Encryption key
 * @returns Encrypted data as base64 string with IV prepended
 */
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)

  const iv = generateIV()

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv as BufferSource,
    },
    key,
    dataBuffer
  )

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  // Convert to base64
  return arrayBufferToBase64(combined)
}

/**
 * Decrypt data using AES-GCM
 * @param encryptedData - Base64 encoded encrypted data with IV
 * @param key - Decryption key
 * @returns Decrypted string
 */
export async function decrypt(
  encryptedData: string,
  key: CryptoKey
): Promise<string> {
  // Convert from base64
  const combined = base64ToArrayBuffer(encryptedData)

  // Extract IV and encrypted data
  const iv = combined.slice(0, IV_LENGTH)
  const data = combined.slice(IV_LENGTH)

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv as BufferSource,
    },
    key,
    data
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

/**
 * Validate password strength
 * Minimum 12 characters, must include letters, numbers, and special characters
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Wachtwoord moet minimaal 12 tekens bevatten')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet kleine letters bevatten')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet hoofdletters bevatten')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Wachtwoord moet cijfers bevatten')
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Wachtwoord moet speciale tekens bevatten')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Export salt as base64 for storage
 */
export function exportSalt(salt: Uint8Array): string {
  return arrayBufferToBase64(salt)
}

/**
 * Import salt from base64
 */
export function importSalt(base64Salt: string): Uint8Array {
  return base64ToArrayBuffer(base64Salt)
}
