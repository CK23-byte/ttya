import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Link as LinkIcon, Download, Mail, Copy, ArrowLeft,
  Shield, FileText, Users, AlertCircle, Loader, ExternalLink, Check
} from 'lucide-react'

interface ProfileData {
  profile: {
    id: string
    fullName: string
    completionPercentage: number
    notaryLinkToken: string | null
  }
  executor: {
    name: string
    email: string
    relationship: string
    hasNotary: boolean
    notaryName?: string
    notaryEmail?: string
  } | null
  recipients: Array<{ name: string; relationship: string }>
}

export default function LivingLegacyFinalizationPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [finalizing, setFinalizing] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [notaryLink, setNotaryLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/legacy/get-profile?profileId=${profileId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile')
      }

      setProfileData(data)

      // Check if already finalized
      if (data.profile.notaryLinkToken) {
        setFinalized(true)
        setNotaryLink(`${window.location.origin}/legacy/activate/${data.profile.notaryLinkToken}`)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!profileData || profileData.profile.completionPercentage < 100) {
      setError('Profile must be 100% complete before finalization')
      return
    }

    setFinalizing(true)
    setError(null)

    try {
      const response = await fetch('/api/legacy/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finalize profile')
      }

      setFinalized(true)
      setNotaryLink(data.notaryLinkUrl)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setFinalizing(false)
    }
  }

  const copyToClipboard = async () => {
    if (!notaryLink) return

    try {
      await navigator.clipboard.writeText(notaryLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const downloadDocumentation = () => {
    if (!profileData) return

    const docContent = `
LIVING LEGACY ACTIVATION INSTRUCTIONS

Profile: ${profileData.profile.fullName}
Created: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

EXECUTOR INFORMATION
────────────────────────────────────────────────────────────
${profileData.executor ? `
Name: ${profileData.executor.name}
Email: ${profileData.executor.email}
Relationship: ${profileData.executor.relationship}
${profileData.executor.hasNotary ? `
Notary: ${profileData.executor.notaryName}
Notary Email: ${profileData.executor.notaryEmail}
` : ''}
` : 'No executor information provided'}

ACTIVATION LINK
────────────────────────────────────────────────────────────
${notaryLink || 'Link will be generated after finalization'}

⚠️ IMPORTANT: Keep this link secure. Anyone with this link can
request activation of the Living Legacy.

DESIGNATED RECIPIENTS (${profileData.recipients.length})
────────────────────────────────────────────────────────────
${profileData.recipients.map(r => `• ${r.name} (${r.relationship})`).join('\n')}

HOW TO ACTIVATE
────────────────────────────────────────────────────────────
1. When ${profileData.profile.fullName} passes away, the executor should
   visit the activation link above.

2. The executor will need to upload:
   • Death certificate
   • Proof of executor status (will, court document, etc.)
   • Government-issued ID

3. TalkToYouAI's verification team will review the documents
   (typically within 24-48 hours).

4. Once verified, all designated recipients will automatically
   receive access via email.

STORAGE RECOMMENDATIONS
────────────────────────────────────────────────────────────
• Store this document in a secure location
• Consider including it with your will
• Share with your executor and trusted family members
• Keep a digital copy in a password manager
• Inform your executor where to find this information

SUPPORT
────────────────────────────────────────────────────────────
Questions? Contact TalkToYouAI Support:
Email: support@talktoyouai.com
Website: https://talktoyouai.com

═══════════════════════════════════════════════════════════

Generated by TalkToYouAI Living Legacy System
Date: ${new Date().toLocaleString()}
`

    const blob = new Blob([docContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profileData.profile.fullName.replace(/\s+/g, '_')}_Living_Legacy_Instructions.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendToExecutor = () => {
    if (!profileData?.executor || !notaryLink) return

    const subject = encodeURIComponent(`Important: Living Legacy Executor Instructions - ${profileData.profile.fullName}`)
    const body = encodeURIComponent(`Dear ${profileData.executor.name},

${profileData.profile.fullName} has designated you as the executor of their Living Legacy on TalkToYouAI.

IMPORTANT: Please keep this email in a safe place.

When the time comes, you will use this secure link to activate their legacy for designated family members:

${notaryLink}

You can find detailed instructions in the attached documentation.

If you have any questions, please contact support@talktoyouai.com

With respect,
TalkToYouAI Team`)

    window.open(`mailto:${profileData.executor.email}?subject=${subject}&body=${body}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load profile'}</p>
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { profile, executor, recipients } = profileData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/living-legacy/create/${profileId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalize Your Living Legacy</h1>
              <p className="text-sm text-gray-600">Generate your notary activation link</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Completion Check */}
        {profile.completionPercentage < 100 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Profile Not Complete</h3>
                <p className="text-yellow-800 mb-4">
                  Your profile is {profile.completionPercentage}% complete. You need to complete all required sections before finalizing.
                </p>
                <button
                  onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
                >
                  Complete Your Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already Finalized */}
        {finalized && notaryLink && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Legacy is Complete! 🎉</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your Living Legacy has been finalized. The notary activation link has been generated and is ready to share with your executor.
            </p>
          </div>
        )}

        {/* Not Yet Finalized */}
        {!finalized && profile.completionPercentage >= 100 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Finalize</h2>
              <p className="text-gray-600">
                Your profile is complete. Click below to generate your notary activation link.
              </p>
            </div>

            <button
              onClick={handleFinalize}
              disabled={finalizing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {finalizing ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Generate Notary Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Notary Link Display */}
        {finalized && notaryLink && (
          <div className="space-y-6">
            {/* Step 1: Notary Link */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-6 h-6 text-orange-500" />
                    Notary Activation Link
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This encrypted link will be used to activate your legacy after you pass away.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 text-sm bg-white px-4 py-3 rounded border border-gray-300 overflow-x-auto">
                        {notaryLink}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      ⚠️ Keep this link secure. Anyone with it can request activation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Download Documentation */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Download className="w-6 h-6 text-blue-500" />
                    Download Documentation
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Legal documents to include in your will or give to your executor.
                  </p>

                  <button
                    onClick={downloadDocumentation}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Download Instructions (TXT)
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Share with Executor */}
            {executor && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-green-500" />
                      Share with Executor
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{executor.name}</div>
                          <div className="text-sm text-gray-600">{executor.relationship}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">{executor.email}</div>
                    </div>

                    <button
                      onClick={sendToExecutor}
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Send Instructions via Email
                    </button>

                    {executor.hasNotary && executor.notaryEmail && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-2">Optional: Share with Notary</p>
                        <p className="text-sm text-purple-700 mb-3">
                          {executor.notaryName} ({executor.notaryEmail})
                        </p>
                        <button
                          onClick={() => {
                            const subject = encodeURIComponent(`Living Legacy Notary Information - ${profile.fullName}`)
                            const body = encodeURIComponent(`Dear ${executor.notaryName},\n\nThis email contains notary information for ${profile.fullName}'s Living Legacy...\n\n${notaryLink}`)
                            window.open(`mailto:${executor.notaryEmail}?subject=${subject}&body=${body}`)
                          }}
                          className="text-sm px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          Send to Notary
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📌 Important Notes</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You can continue editing your legacy until it's activated</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep the activation link secure - store it in a password manager or safe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Make sure your executor knows where to find the link and documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Consider including this information in your will or estate planning documents</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Recipients ({recipients.length} people) will automatically receive access after verification</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition"
              >
                Exit to Main Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
