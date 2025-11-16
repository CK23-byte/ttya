/**
 * WhatsApp Export Uploader Component
 */

import { useState } from 'react'
import { Upload, FileText, Check, X } from 'lucide-react'
import { parseWhatsAppExport, isValidWhatsAppExport, getUniqueSenders } from '../utils/whatsappParser'
import { WhatsAppMessage } from '../types'

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

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.zip')) {
      setError('Alleen .txt bestanden worden ondersteund')
      return
    }

    try {
      const text = await file.text()
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
      setError('Fout bij het lezen van het bestand')
      console.error(err)
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
          Sleep je WhatsApp export hier of klik om te uploaden
        </p>
        <p className="text-xs text-gray-500 mb-4">
          .txt bestand (geëxporteerd vanuit WhatsApp)
        </p>
        <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition">
          Bestand Kiezen
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
                Selecteer de persoon wiens schrijfstijl je wilt imiteren:
              </label>
              <select
                value={selectedSender}
                onChange={(e) => setSelectedSender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">-- Kies een naam --</option>
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
          Hoe exporteer je WhatsApp berichten?
        </p>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Open de chat in WhatsApp</li>
          <li>Tik op de naam bovenaan</li>
          <li>Scroll naar beneden en kies "Exporteer chat"</li>
          <li>Kies "Zonder media"</li>
          <li>Upload het .txt bestand hier</li>
        </ol>
      </div>
    </div>
  )
}
