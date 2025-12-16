import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext'

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
const AccountPage = lazy(() => import('./pages/AccountPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const LivingLegacyPage = lazy(() => import('./pages/LivingLegacyPage'))
const LivingLegacyPricingPage = lazy(() => import('./pages/LivingLegacyPricingPage'))
const LivingLegacyOnboardingPage = lazy(() => import('./pages/LivingLegacyOnboardingPage'))
const LivingLegacyCreationDashboard = lazy(() => import('./pages/LivingLegacyCreationDashboard'))
const LivingLegacyRecordMessagePage = lazy(() => import('./pages/LivingLegacyRecordMessagePage'))
const LivingLegacyVoiceSetupPage = lazy(() => import('./pages/LivingLegacyVoiceSetupPage'))
const LivingLegacyAvatarSetupPage = lazy(() => import('./pages/LivingLegacyAvatarSetupPage'))
const LivingLegacyPreviewPage = lazy(() => import('./pages/LivingLegacyPreviewPage'))
const LivingLegacyFinalizationPage = lazy(() => import('./pages/LivingLegacyFinalizationPage'))
const LivingLegacyMessageRecordingPage = lazy(() => import('./pages/LivingLegacyMessageRecordingPage'))
const LivingLegacyTimeCapsulePage = lazy(() => import('./pages/LivingLegacyTimeCapsulePage'))
const LivingLegacyRecipientManagementPage = lazy(() => import('./pages/LivingLegacyRecipientManagementPage'))
const LivingLegacyProgressDashboardPage = lazy(() => import('./pages/LivingLegacyProgressDashboardPage'))
const LivingLegacyAuthPage = lazy(() => import('./pages/LivingLegacyAuthPage'))
const LivingLegacyUploadDashboard = lazy(() => import('./pages/LivingLegacyUploadDashboard'))
const LivingLegacyConversationPage = lazy(() => import('./pages/LivingLegacyConversationPage'))
const LivingLegacyConversationPageWebRTC = lazy(() => import('./pages/LivingLegacyConversationPageWebRTC'))
const VoiceCallPage = lazy(() => import('./pages/VoiceCallPage'))
const ProfileImprovementPage = lazy(() => import('./pages/ProfileImprovementPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

function App() {
  // Log app version on load
  useEffect(() => {
    console.log('🚀 TalkToYouAI v2.10.0 - Avatar Upload Edition')
    console.log('📋 Features: Profile photo upload, Security fixes, Supabase Storage integration')
    console.log('⏰ Deployed:', new Date().toISOString())
    console.log('🔧 Branch: claude/setup-react-vite-encryption-01RczCBBui9fkreqGXQU4MNk')
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
                <Route path="/voice-call" element={<VoiceCallPage />} />
                <Route path="/profile-improvement" element={<ProfileImprovementPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/living-legacy" element={<LivingLegacyPage />} />
                <Route path="/living-legacy/auth" element={<LivingLegacyAuthPage />} />
                <Route path="/living-legacy/upload-dashboard" element={<LivingLegacyUploadDashboard />} />
                <Route path="/living-legacy/conversation" element={<LivingLegacyConversationPage />} />
                <Route path="/living-legacy/conversation-webrtc" element={<LivingLegacyConversationPageWebRTC />} />
                <Route path="/pricing/living-legacy" element={<LivingLegacyPricingPage />} />
                <Route path="/living-legacy/onboarding" element={<LivingLegacyOnboardingPage />} />
                <Route path="/living-legacy/create/:profileId" element={<LivingLegacyCreationDashboard />} />
                <Route path="/living-legacy/:profileId/record" element={<LivingLegacyRecordMessagePage />} />
                <Route path="/living-legacy/:profileId/voice-setup" element={<LivingLegacyVoiceSetupPage />} />
                <Route path="/living-legacy/:profileId/avatar-setup" element={<LivingLegacyAvatarSetupPage />} />
                <Route path="/living-legacy/:profileId/preview" element={<LivingLegacyPreviewPage />} />
                <Route path="/living-legacy/:profileId/finalize" element={<LivingLegacyFinalizationPage />} />
                <Route path="/living-legacy/record-message" element={<LivingLegacyMessageRecordingPage />} />
                <Route path="/living-legacy/time-capsule" element={<LivingLegacyTimeCapsulePage />} />
                <Route path="/living-legacy/recipients" element={<LivingLegacyRecipientManagementPage />} />
                <Route path="/living-legacy/progress" element={<LivingLegacyProgressDashboardPage />} />
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
