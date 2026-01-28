/**
 * Message Input Component
 *
 * Bottom input area with emoji, text field, and send button (WhatsApp style)
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Mic } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 100 // ~4 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-whatsapp-background border-t border-gray-200 px-4 py-2">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 transition mb-1"
          disabled={disabled}
          aria-label="Open emoji picker"
        >
          <Smile className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Text Input */}
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
          <label htmlFor="messageInput" className="sr-only">Type a message</label>
          <textarea
            ref={textareaRef}
            id="messageInput"
            name="messageInput"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Typ een bericht"
            className="flex-1 outline-none resize-none max-h-[100px] text-[15px] leading-relaxed"
            rows={1}
            disabled={disabled}
            aria-label="Message input"
          />
        </div>

        {/* Send or Voice Button */}
        {message.trim() ? (
          <button
            type="submit"
            disabled={disabled}
            className="p-2 bg-whatsapp-teal text-white rounded-full hover:bg-whatsapp-darkgreen transition disabled:opacity-50 mb-1"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition mb-1"
            disabled={disabled}
            aria-label="Start voice recording"
          >
            <Mic className="w-6 h-6" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  )
}
