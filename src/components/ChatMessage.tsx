/**
 * Chat Message Component
 *
 * Individual message bubble (WhatsApp style)
 */

import { Check, CheckCheck } from 'lucide-react'
import { Message } from '../types'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isUser
            ? 'bg-whatsapp-lightgreen rounded-br-none'
            : 'bg-white rounded-bl-none shadow-sm'
        }`}
      >
        <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[11px] text-gray-500">{time}</span>
          {isUser && (
            <span className="text-gray-500">
              {message.status === 'sending' && <Check className="w-3 h-3" />}
              {message.status === 'sent' && <CheckCheck className="w-3 h-3 text-blue-500" />}
              {message.status === 'error' && <span className="text-red-500">!</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
