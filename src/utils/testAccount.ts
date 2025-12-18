/**
 * Test Account Utilities
 *
 * Provides utilities for bypassing credit checks for test accounts
 * Test account: caskaptein@gmail.com (unlimited credits)
 */

const TEST_ACCOUNT_EMAILS = [
  'caskaptein@gmail.com',
  // Add more test accounts here if needed
]

/**
 * Check if an email is a test account with unlimited credits
 */
export function isTestAccount(email: string | null | undefined): boolean {
  if (!email) return false
  return TEST_ACCOUNT_EMAILS.includes(email.toLowerCase())
}

/**
 * Check if user can afford an action (bypasses check for test accounts)
 * @param userEmail User's email address
 * @param currentCredits Current credit balance
 * @param requiredCredits Credits required for action
 * @returns true if user can afford, false otherwise
 */
export function canAffordAction(
  userEmail: string | null | undefined,
  currentCredits: number,
  requiredCredits: number
): boolean {
  // Test accounts have unlimited access
  if (isTestAccount(userEmail)) {
    return true
  }

  // Regular users check actual credits
  return currentCredits >= requiredCredits
}

/**
 * Get effective credits for display (shows ∞ for test accounts)
 * @param userEmail User's email address
 * @param actualCredits Actual credit balance
 * @returns Display string for credits
 */
export function getDisplayCredits(
  userEmail: string | null | undefined,
  actualCredits: number
): string {
  if (isTestAccount(userEmail)) {
    return '∞'
  }
  return actualCredits.toString()
}

/**
 * Check if credits should be deducted (test accounts don't lose credits)
 * @param userEmail User's email address
 * @returns true if credits should be deducted, false for test accounts
 */
export function shouldDeductCredits(userEmail: string | null | undefined): boolean {
  return !isTestAccount(userEmail)
}
