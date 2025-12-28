/**
 * Video Call Page - REDIRECT to Tavus Video
 *
 * NOTE: HeyGen has been phased out in favor of Tavus.
 * This page now redirects to VideoTavusPage for all video calls.
 */

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader } from 'lucide-react'

export default function VideoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const profileId = searchParams.get('profile')

  useEffect(() => {
    // Redirect to Simli video page (HeyGen phased out, using Simli for photo-based avatars)
    if (profileId) {
      navigate(`/video-simli?profile=${profileId}`, { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }, [profileId, navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center space-y-4">
        <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
        <p className="text-gray-300 text-lg">Redirecting to video call...</p>
      </div>
    </div>
  )
}
