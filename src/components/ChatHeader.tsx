/**
 * Chat Header Component
 *
 * Top bar with avatar, name, and status (WhatsApp style)
 */

import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ChatHeaderProps {
  name: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
}

export default function ChatHeader({ name, avatar, isOnline, lastSeen }: ChatHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-whatsapp-teal text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-white/10 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => navigate('/personality-builder')}
        >
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-semibold text-lg">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 cursor-pointer" onClick={() => navigate('/personality-builder')}>
          <h2 className="font-semibold text-[16px] leading-tight">{name}</h2>
          <p className="text-xs text-white/80">
            {isOnline ? 'online' : lastSeen || 'laatst gezien onbekend'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/video')}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/video')}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
