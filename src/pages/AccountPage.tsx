/**
 * Account Page
 *
 * Shows user account info, credits balance, and purchase options
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { logger } from '../utils/logger'
import {
  ArrowLeft,
  CreditCard,
  Coins,
  Gift,
  History,
  User,
  Mail,
  Crown,
  Sparkles,
  ExternalLink,
  Key,
  Lock,
  Edit3,
  Check,
  X,
  Camera,
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import Header from '../components/Header'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, profile, credits, isConfigured } = useSupabaseAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleSaveName = async () => {
    if (!user) return

    try {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)

      if (error) {
        logger.error('Error updating display name:', error)
        alert('Something went wrong saving your name. Please try again.')
        return
      }

      setIsEditingName(false)
      // Refresh the page to show updated name
      window.location.reload()
    } catch (error) {
      logger.error('Error saving name:', error)
      alert('Something went wrong saving your name.')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size is 2MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const { supabase } = await import('../lib/supabase')

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        logger.error('Upload error:', uploadError)
        alert('Something went wrong with uploading. Please try again.')
        setIsUploadingAvatar(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      if (updateError) {
        logger.error('Error updating profile:', updateError)
        alert('Something went wrong with saving. Please try again.')
        setIsUploadingAvatar(false)
        return
      }

      // Refresh page to show new avatar
      window.location.reload()
    } catch (error) {
      logger.error('Error uploading avatar:', error)
      alert('Something went wrong. Please try again.')
      setIsUploadingAvatar(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    try {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        logger.error('Error updating password:', error)
        setPasswordError(error.message || 'Something went wrong changing your password')
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Close password change form after 2 seconds
      setTimeout(() => {
        setIsChangingPassword(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error) {
      logger.error('Error changing password:', error)
      setPasswordError('Something went wrong. Please try again.')
    }
  }

  // Redirect if not logged in with Supabase
  if (!user || !isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Not Logged In
          </h2>
          <p className="text-gray-600 mb-6">
            Log in with your email to view your account.
          </p>
          <button
            onClick={() => navigate('/email-auth')}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <Header variant="transparent" />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile, password and subscription</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Profile Information
          </h3>

          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="relative">
                {/* Avatar Display */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(profile?.display_name || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>

                {/* Camera icon overlay */}
                {!isUploadingAvatar && (
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition shadow-lg"
                    title="Upload photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}

                {/* Loading spinner */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click the camera icon to upload a photo
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Max 2MB • JPG, PNG of GIF
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{profile?.display_name || 'No name set'}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-500" />
            Change Password
          </h3>

          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Password successfully changed!
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Subscription Management Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            Manage Subscription
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Current Plan</span>
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-600">
                You are currently using the free plan with basic features.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
              <button
                onClick={() => alert('Cancel subscription coming soon!')}
                className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8" />
              <div>
                <p className="text-white/80 text-sm">Total Balance</p>
                <p className="text-3xl font-bold">{credits} credits</p>
              </div>
            </div>
            <Crown className="w-12 h-12 text-white/30" />
          </div>

          {/* Universal Credits Breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Text Usage */}
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{credits}</p>
              <p className="text-white/80 text-xs mt-1">💬 Text</p>
              <p className="text-white/60 text-xs">messages</p>
            </div>

            {/* Voice Usage */}
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{Math.floor(credits / 12)}</p>
              <p className="text-white/80 text-xs mt-1">🎙️ Voice</p>
              <p className="text-white/60 text-xs">minutes</p>
            </div>

            {/* Video Usage */}
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{Math.floor(credits / 20)}</p>
              <p className="text-white/80 text-xs mt-1">📹 Video</p>
              <p className="text-white/60 text-xs">minutes</p>
            </div>
          </div>

          <div className="bg-white/20 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Universal credits work for all features: 1 credit = 1 message, 5s voice, or 3s video</span>
            </p>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-500" />
            Buy Credits
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Purchase voice and video credits for calling features. Click to view all options.
          </p>

          <button
            onClick={() => navigate('/pricing')}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-rose-600 transition"
          >
            View All Credit Packs
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Transaction History
          </h3>

          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Your transactions will appear here after your first purchase
            </p>
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Need help? View our FAQ</span>
          </a>
        </div>
      </main>
    </div>
  )
}
