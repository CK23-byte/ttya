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

function App() {
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
              <Route path="/account" element={<AccountPage />} />
              <Route path="/living-legacy" element={<LivingLegacyPage />} />
            </Routes>
          </PaymentProvider>
        </AuthProvider>
      </SupabaseAuthProvider>
    </Router>
  )
}

export default App
