import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext'
import LoginScreen from './components/LoginScreen'
import PasswordSetup from './components/PasswordSetup'
import EmailAuth from './components/EmailAuth'
import AuthChoicePage from './pages/AuthChoicePage'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import PricingPage from './pages/PricingPage'
import MemoriesPage from './pages/MemoriesPage'
import PersonalityBuilderPage from './pages/PersonalityBuilderPage'
import VideoPage from './pages/VideoPage'
import AccountPage from './pages/AccountPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LivingLegacyPage from './pages/LivingLegacyPage'
import LivingLegacyPricingPage from './pages/LivingLegacyPricingPage'
import LivingLegacyOnboardingPage from './pages/LivingLegacyOnboardingPage'
import LivingLegacyCreationDashboard from './pages/LivingLegacyCreationDashboard'
import LivingLegacyRecordMessagePage from './pages/LivingLegacyRecordMessagePage'
import LivingLegacyVoiceSetupPage from './pages/LivingLegacyVoiceSetupPage'
import LivingLegacyAvatarSetupPage from './pages/LivingLegacyAvatarSetupPage'
import LivingLegacyPreviewPage from './pages/LivingLegacyPreviewPage'
import LivingLegacyFinalizationPage from './pages/LivingLegacyFinalizationPage'
import LivingLegacyMessageRecordingPage from './pages/LivingLegacyMessageRecordingPage'
import LivingLegacyTimeCapsulePage from './pages/LivingLegacyTimeCapsulePage'
import LivingLegacyRecipientManagementPage from './pages/LivingLegacyRecipientManagementPage'
import LivingLegacyProgressDashboardPage from './pages/LivingLegacyProgressDashboardPage'
import LivingLegacyAuthPage from './pages/LivingLegacyAuthPage'
import LivingLegacyUploadDashboard from './pages/LivingLegacyUploadDashboard'
import LivingLegacyConversationPage from './pages/LivingLegacyConversationPage'
import LivingLegacyConversationPageWebRTC from './pages/LivingLegacyConversationPageWebRTC'
import VoiceCallPage from './pages/VoiceCallPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'

function App() {
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
          </PaymentProvider>
        </AuthProvider>
      </SupabaseAuthProvider>
    </Router>
  )
}

export default App
