/**
 * WhatsApp Export Uploader Component
 */

import { useState } from 'react'
import { Upload, FileText, Check, X } from 'lucide-react'
import JSZip from 'jszip'
import { parseWhatsAppExport, isValidWhatsAppExport, getUniqueSenders } from '../utils/whatsappParser'
import { WhatsAppMessage } from '../types'
import { logger } from '../utils/logger'

interface WhatsAppUploaderProps {
  onMessagesLoaded: (messages: WhatsAppMessage[], sender: string) => void
}

export default function WhatsAppUploader({ onMessagesLoaded }: WhatsAppUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [selectedSender, setSelectedSender] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleFile = async (file: File) => {
    setError('')

    // Security: File size validation (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      setError('Bestand is te groot. Maximale grootte is 50MB')
      return
    }

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.zip')) {
      setError('Alleen .txt of .zip bestanden worden ondersteund')
      return
    }

    try {
      let text: string

      // Handle ZIP files
      if (file.name.endsWith('.zip')) {
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(file)

        // Security: Check total uncompressed size (max 200MB)
        const MAX_UNCOMPRESSED_SIZE = 200 * 1024 * 1024
        let totalSize = 0
        Object.values(zipContent.files).forEach(f => {
          totalSize += (f as any)._data?.uncompressedSize || 0
        })

        if (totalSize > MAX_UNCOMPRESSED_SIZE) {
          setError('Uitgepakte bestandsgrootte is te groot (max 200MB)')
          return
        }

        // Find the .txt file in the ZIP (with path traversal protection)
        const txtFile = Object.keys(zipContent.files).find(
          filename => {
            const normalized = filename.replace(/\\/g, '/')
            return normalized.endsWith('.txt') &&
                   !normalized.startsWith('__MACOSX') &&
                   !normalized.includes('../') &&
                   !normalized.startsWith('/')
          }
        )

        if (!txtFile) {
          setError('Geen .txt bestand gevonden in het ZIP archief')
          return
        }

        text = await zipContent.files[txtFile].async('text')
      } else {
        // Handle plain .txt files
        text = await file.text()
      }

      const parsedMessages = parseWhatsAppExport(text)

      if (!isValidWhatsAppExport(text)) {
        setError('Dit lijkt geen geldig WhatsApp export bestand te zijn')
        return
      }

      setMessages(parsedMessages)

      // Get unique senders
      const senders = getUniqueSenders(parsedMessages)
      if (senders.length === 1) {
        setSelectedSender(senders[0])
      }
    } catch (err) {
      setError('Error reading the file')
      logger.error('WhatsApp file upload error', err)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleConfirm = () => {
    if (selectedSender && messages.length > 0) {
      onMessagesLoaded(messages, selectedSender)
      setMessages([])
      setSelectedSender('')
    }
  }

  const senders = getUniqueSenders(messages)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">WhatsApp Export</h3>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag your WhatsApp export here or click to upload
        </p>
        <p className="text-xs text-gray-500 mb-4">
          .txt of .zip bestand (geëxporteerd vanuit WhatsApp, Messenger, Telegram, etc.)
        </p>
        <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition">
          Choose File
          <input
            type="file"
            accept=".txt,.zip"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Preview */}
      {messages.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {messages.length} berichten geïmporteerd
              </p>
              <p className="text-xs text-green-700 mt-1">
                Eerste berichten: {messages.slice(0, 3).map(m => m.content.substring(0, 30)).join(', ')}...
              </p>
            </div>
          </div>

          {/* Sender Selection */}
          {senders.length > 1 && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select the person whose writing style you want to imitate:
              </label>
              <select
                value={selectedSender}
                onChange={(e) => setSelectedSender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">-- Choose a name --</option>
                {senders.map((sender) => (
                  <option key={sender} value={sender}>
                    {sender}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedSender}
            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bevestigen
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          Hoe exporteer je berichten?
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-blue-800 font-semibold mb-1">WhatsApp:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside pl-2">
              <li>Open de chat in WhatsApp</li>
              <li>Tap the name at the top</li>
              <li>Scroll down and choose "Export chat"</li>
              <li>Choose "Without media" for .txt or "With media" for .zip</li>
              <li>Upload the file here</li>
            </ol>
          </div>
          <p className="text-xs text-blue-600 italic">
            Messenger, Telegram en andere apps hebben vergelijkbare export opties in de chat instellingen.
          </p>
        </div>
      </div>
    </div>
  )
}
