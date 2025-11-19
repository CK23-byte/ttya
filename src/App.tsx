import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'
import LoginScreen from './components/LoginScreen'
import PasswordSetup from './components/PasswordSetup'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import MemoriesPage from './pages/MemoriesPage'
import PersonalityBuilderPage from './pages/PersonalityBuilderPage'
import VideoPage from './pages/VideoPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <PaymentProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/setup" element={<PasswordSetup />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/personality-builder" element={<PersonalityBuilderPage />} />
            <Route path="/video" element={<VideoPage />} />
          </Routes>
        </PaymentProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
