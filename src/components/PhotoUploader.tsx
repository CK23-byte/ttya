/**
 * Photo Uploader Component
 */

import { useState } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { PhotoMemory } from '../types'
import { logger } from '../utils/logger'

interface PhotoUploaderProps {
  onPhotosLoaded: (photos: PhotoMemory[]) => void
  maxSize?: number // in MB
}

export default function PhotoUploader({ onPhotosLoaded, maxSize = 10 }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoMemory[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas not supported'))
            return
          }

          // Max dimensions
          const maxWidth = 1200
          const maxHeight = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = async (files: FileList) => {
    setError('')

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSizeBytes = maxSize * 1024 * 1024

    const newPhotos: PhotoMemory[] = []

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        setError('Alleen JPG, PNG en WebP afbeeldingen zijn toegestaan')
        continue
      }

      if (file.size > maxSizeBytes) {
        setError(`Bestand te groot: ${file.name} (max ${maxSize}MB)`)
        continue
      }

      try {
        const compressed = await compressImage(file)
        newPhotos.push({
          id: Date.now().toString() + Math.random(),
          base64Data: compressed,
          caption: '',
          timestamp: Date.now(),
        })
      } catch (err) {
        logger.error('Error compressing image:', err)
        setError('Error processing image')
      }
    }

    const updatedPhotos = [...photos, ...newPhotos]
    setPhotos(updatedPhotos)
    onPhotosLoaded(updatedPhotos)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
  }

  const removePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id)
    setPhotos(updated)
    onPhotosLoaded(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-800">Photos</h3>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 hover:border-pink-400'
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
          Drag photos here or click to upload
        </p>
        <p className="text-xs text-gray-500 mb-4">
          JPG, PNG, WebP - Max {maxSize}MB per photo
        </p>
        <label className="inline-block px-4 py-2 bg-pink-600 text-white rounded-lg cursor-pointer hover:bg-pink-700 transition">
          Choose Photos
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
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

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">{photos.length} photo(s) uploaded</p>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.base64Data}
                  alt="Memory"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
