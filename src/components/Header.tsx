/**
 * Header Component
 *
 * Reusable header with logo and user menu
 * Features:
 * - Logo that links to home
 * - User initials dropdown when logged in
 * - Sign In button when not logged in
 * - Profile management options
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Zap,
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface HeaderProps {
  variant?: 'default' | 'transparent'
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useSupabaseAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Get user initials from email or display name
  const getUserInitials = () => {
    if (profile?.display_name) {
      const names = profile.display_name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return profile.display_name.substring(0, 2).toUpperCase()
    }

    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }

    return 'U'
  }

  const handleSignOut = async () => {
    setIsDropdownOpen(false)
    await signOut()
    navigate('/')
  }

  const headerClassName = variant === 'transparent'
    ? 'bg-white/80 backdrop-blur-sm border-b border-orange-100'
    : 'bg-white border-b border-gray-200'

  return (
    <nav className={`${headerClassName} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              TalkToYouAI
            </span>
          </div>
          {/* Version Badge */}
          <span
            className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full border border-orange-200"
            title="Build: 2025-12-18 10:57 UTC"
          >
            v2.11.0
          </span>
        </div>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Navigation Links */}
          <button
            onClick={() => navigate('/pricing')}
            className="text-sm sm:text-base text-gray-600 hover:text-orange-600 font-medium transition-colors px-2"
          >
            Pricing
          </button>

          {/* Credit Display - Always visible when logged in */}
          {user && profile && (
            <div
              onClick={() => navigate('/account')}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-full cursor-pointer hover:shadow-sm transition group"
              title="View your credits"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {profile.credits || 0}
              </span>
              <span className="text-xs text-gray-600 hidden sm:inline">credits</span>
            </div>
          )}

          {/* User Menu or Sign In */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full shadow-sm hover:shadow-md transition group"
              >
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {getUserInitials()}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 truncate">
                      {profile?.display_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate('/dashboard')
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate('/account')
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate('/pricing')
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">Manage Subscription</span>
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/email-auth')}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full shadow-sm hover:shadow-md transition text-xs sm:text-sm font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
