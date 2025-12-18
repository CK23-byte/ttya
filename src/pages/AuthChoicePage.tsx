/**
 * Auth Choice Page
 *
 * Redirects to email authentication (local auth removed)
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

export default function AuthChoicePage() {
  const navigate = useNavigate()
  const { user } = useSupabaseAuth()

  // Redirect to email auth or dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/email-auth', { replace: true })
    }
  }, [user, navigate])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
