import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext'
import { APP_VERSION, APP_NAME } from './constants/version'

// Eager load: Only landing and auth pages (critical for first paint)
import LandingPage from './pages/LandingPage'
import AuthChoicePage from './pages/AuthChoicePage'

// Lazy load: All other pages (loaded on demand)
const LoginScreen = lazy(() => import('./components/LoginScreen'))
const PasswordSetup = lazy(() => import('./components/PasswordSetup'))
const EmailAuth = lazy(() => import('./components/EmailAuth'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'))
const PersonalityBuilderPage = lazy(() => import('./pages/PersonalityBuilderPage'))
const VideoPage = lazy(() => import('./pages/VideoPage'))
const VideoTavusPage = lazy(() => import('./pages/VideoTavusPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const VoiceCallPage = lazy(() => import('./pages/VoiceCallPage'))
const ProfileImprovementPage = lazy(() => import('./pages/ProfileImprovementPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

// Loading component for lazy-loaded routes - minimal, fast
const PageLoader = () => (
  <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-rose-500 animate-pulse z-50" />
)

function App() {
  // Log app version on load
  useEffect(() => {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f97316; font-weight: bold;')
    console.log(`%c🚀 ${APP_NAME} v${APP_VERSION}`, 'color: #f97316; font-size: 16px; font-weight: bold;')
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f97316; font-weight: bold;')
    console.log('%c📦 New in v2.12.0:', 'color: #10b981; font-weight: bold;')
    console.log('   ✅ HeyGen Custom Avatar Creation')
    console.log('   ✅ Avatar Status Polling with Timeout Fallback')
    console.log('   ✅ Vercel Serverless Backend Integration')
    console.log('   ✅ API Route Rewrite Fix (405 errors resolved)')
    console.log('')
    console.log('%c📋 Features:', 'color: #3b82f6; font-weight: bold;')
    console.log('   • Full authentication system (Supabase)')
    console.log('   • Row Level Security (RLS)')
    console.log('   • Auto-profile creation')
    console.log('   • Custom avatar generation')
    console.log('   • Voice cloning integration')
    console.log('   • Universal credits system')
    console.log('')
    console.log('%c⏰ Deployed:', 'color: #8b5cf6;', new Date().toISOString())
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f97316; font-weight: bold;')
  }, [])

  // Security: Enforce HTTPS in production
  useEffect(() => {
    if (
      import.meta.env.PROD &&
      window.location.protocol === 'http:' &&
      !window.location.hostname.includes('localhost')
    ) {
      window.location.href = window.location.href.replace('http:', 'https:')
    }
  }, [])

  return (
    <Router>
      <SupabaseAuthProvider>
        <AuthProvider>
          <PaymentProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthChoicePage />} />
                <Route path="/setup" element={<PasswordSetup />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/email-auth" element={<EmailAuth />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/memories" element={<MemoriesPage />} />
                <Route path="/personality-builder" element={<PersonalityBuilderPage />} />
                <Route path="/video" element={<VideoPage />} />
                <Route path="/video-tavus" element={<VideoTavusPage />} />
                <Route path="/voice-call" element={<VoiceCallPage />} />
                <Route path="/profile-improvement" element={<ProfileImprovementPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </Suspense>
          </PaymentProvider>
        </AuthProvider>
      </SupabaseAuthProvider>
    </Router>
  )
}

export default App
