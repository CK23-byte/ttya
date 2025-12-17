/**
import { logger } from '../utils/logger'
 * Audio Uploader Component
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
import { useState } from 'react'
import { logger } from '../utils/logger'
import { Upload, Music, X, Play, Pause } from 'lucide-react'
import { AudioMemory } from '../types'

interface AudioUploaderProps {
  onAudioLoaded: (audio: AudioMemory[]) => void
  maxSize?: number // in MB
}

export default function AudioUploader({ onAudioLoaded, maxSize = 5 }: AudioUploaderProps) {
  const [audioClips, setAudioClips] = useState<AudioMemory[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handleFiles = async (files: FileList) => {
    setError('')

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4']
    const maxSizeBytes = maxSize * 1024 * 1024

    const newClips: AudioMemory[] = []

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
        setError('Alleen MP3, WAV en M4A bestanden zijn toegestaan')
        continue
      }

      if (file.size > maxSizeBytes) {
        setError(`Bestand te groot: ${file.name} (max ${maxSize}MB)`)
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        const duration = await getAudioDuration(base64)

        newClips.push({
          id: Date.now().toString() + Math.random(),
          base64Data: base64,
          note: file.name.replace(/\.(mp3|wav|m4a)$/i, ''),
          duration,
          timestamp: Date.now(),
        })
      } catch (err) {
        logger.error('Error processing audio:', err)
        setError('Fout bij het verwerken van audiobestand')
      }
    }

    const updated = [...audioClips, ...newClips]
    setAudioClips(updated)
    onAudioLoaded(updated)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getAudioDuration = (base64: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio(base64)
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration))
      }
      audio.onerror = () => resolve(0)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
  }

  const removeAudio = (id: string) => {
    const updated = audioClips.filter((a) => a.id !== id)
    setAudioClips(updated)
    onAudioLoaded(updated)
    if (playingId === id) setPlayingId(null)
  }

  const updateNote = (id: string, note: string) => {
    const updated = audioClips.map((a) => (a.id === id ? { ...a, note } : a))
    setAudioClips(updated)
    onAudioLoaded(updated)
  }

  const togglePlay = (id: string, base64: string) => {
    if (playingId === id) {
      setPlayingId(null)
    } else {
      const audio = new Audio(base64)
      audio.play()
      audio.onended = () => setPlayingId(null)
      setPlayingId(id)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Music className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Audio Fragmenten</h3>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
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
          Sleep audio hier of klik om te uploaden
        </p>
        <p className="text-xs text-gray-500 mb-4">
          MP3, WAV, M4A - Max {maxSize}MB per bestand
        </p>
        <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
          Audio Kiezen
          <input
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a"
            multiple
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

      {/* Audio List */}
      {audioClips.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{audioClips.length} audio fragment(en)</p>
          {audioClips.map((clip) => (
            <div key={clip.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <button
                onClick={() => togglePlay(clip.id, clip.base64Data)}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex-shrink-0"
              >
                {playingId === clip.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={clip.note}
                  onChange={(e) => updateNote(clip.id, e.target.value)}
                  placeholder="Notitie (bijv. 'opa's lach')"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duur: {formatDuration(clip.duration)}
                </p>
              </div>

              <button
                onClick={() => removeAudio(clip.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>Tip:</strong> Upload opnames van de stem, lach of typische uitspraken.
          Dit helpt de AI om de persoon nog beter na te bootsen.
        </p>
      </div>
    </div>
  )
}
