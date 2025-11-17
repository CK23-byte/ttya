import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginScreen from './components/LoginScreen'
import PasswordSetup from './components/PasswordSetup'
import ChatPage from './pages/ChatPage'
import MemoriesPage from './pages/MemoriesPage'
import PersonalityBuilderPage from './pages/PersonalityBuilderPage'
import VideoPage from './pages/VideoPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/setup" element={<PasswordSetup />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/personality-builder" element={<PersonalityBuilderPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
