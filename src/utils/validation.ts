/**
 * Validation Utilities
 * Security-focused validation functions
 */

/**
 * Validates password strength
 * Requirements:
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates email format (RFC 5322 compliant)
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Password strength indicator
 * Returns: weak, medium, strong
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const { isValid } = validatePassword(password)

  if (!isValid) return 'weak'

  // Additional checks for strong password
  const hasMultipleSpecialChars = (password.match(/[^A-Za-z0-9]/g) || []).length >= 2
  const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length >= 2
  const isLongEnough = password.length >= 16

  const strongChecks = [hasMultipleSpecialChars, hasMultipleNumbers, isLongEnough].filter(Boolean).length

  if (strongChecks >= 2) return 'strong'
  return 'medium'
}
