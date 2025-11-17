/**
 * Landing Page
 *
 * Beautiful, empathetic landing page for TalkToYouAI
 */

import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Lock,
  MessageCircle,
  Shield,
  Upload,
  UserPlus,
  Video,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TalkToYouAI
              </h1>
            </div>

            {/* Headline */}
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Blijf verbonden met
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                diegenen die je mist
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Een veilige, privacy-first app die AI gebruikt om de persoonlijkheid
              van geliefden te bewaren. Chat, deel herinneringen, en voel de verbinding.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/setup')}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Gratis Beginnen
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                Inloggen
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>End-to-end versleuteld</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                <span>100% privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>Met respect gemaakt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Zo werkt het
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              In slechts 3 eenvoudige stappen kun je beginnen met het bewaren van herinneringen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-purple-600 mb-2">STAP 1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Upload Herinneringen
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Importeer WhatsApp chats, foto's, en audio. Alles wordt versleuteld opgeslagen.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-pink-600 mb-2">STAP 2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Maak een Profiel
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  De AI analyseert schrijfstijl, humor, en persoonlijkheid uit je uploads.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">STAP 3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Begin te Chatten
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Praat met de AI alsof je met je geliefde praat. Warm en herkenbaar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Waarom TalkToYouAI?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Gebouwd met privacy, veiligheid, en empathie als kernwaarden
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                AES-256 Encryptie
              </h4>
              <p className="text-gray-600 text-sm">
                Alle data wordt client-side versleuteld. Niemand kan je herinneringen lezen.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Zero Server Storage
              </h4>
              <p className="text-gray-600 text-sm">
                Alles blijft lokaal in je browser. Volledige controle over je data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                WhatsApp-Style Chat
              </h4>
              <p className="text-gray-600 text-sm">
                Vertrouwde interface waar je je direct thuis voelt.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                AI Personality Analysis
              </h4>
              <p className="text-gray-600 text-sm">
                Claude AI leert van echte berichten voor authentieke responses.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Video Calls (Binnenkort)
              </h4>
              <p className="text-gray-600 text-sm">
                Geanimeerde video gesprekken voor een nog diepere verbinding.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Met Respect Gebouwd
              </h4>
              <p className="text-gray-600 text-sm">
                Een digitale herinnering, geen vervanging. Empathisch en zorgvuldig.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-6 opacity-90" />
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Je Privacy is Heilig
          </h3>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            TalkToYouAI slaat je herinneringen op met militaire-grade encryptie.
            Je master wachtwoord wordt nooit opgeslagen, en alleen jij hebt toegang tot je data.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-white">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <div className="font-semibold">Geen Tracking</div>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <div className="font-semibold">Geen Analytics</div>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <div className="font-semibold">Open Source</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Klaar om te beginnen?
          </h3>
          <p className="text-xl text-gray-600 mb-10">
            Begin vandaag nog met het bewaren van kostbare herinneringen
          </p>
          <button
            onClick={() => navigate('/setup')}
            className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Gratis Account Maken
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 mt-6">
            Geen credit card nodig • 100% gratis • Privacy gegarandeerd
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
              <span className="font-medium text-gray-900">TalkToYouAI</span>
            </div>
            <p className="text-sm">
              Met liefde gebouwd • In nagedachtenis aan allen die we missen
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © 2024 TalkToYouAI • Privacy First • End-to-End Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
