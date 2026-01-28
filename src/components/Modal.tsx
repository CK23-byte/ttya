/**
 * Modal Component - Custom modal dialog
 *
 * Replaces browser alerts with centered, styled modals
 */

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export type ModalType = 'success' | 'error' | 'info' | 'warning'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: ModalType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  showCancel?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />
      default:
        return <Info className="w-12 h-12 text-blue-500" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600'
      default:
        return 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4" aria-hidden="true">
            {getIcon()}
          </div>

          {/* Title */}
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>

          {/* Message */}
          <p id="modal-message" className="text-gray-600 mb-6 whitespace-pre-line">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-6 py-3 text-white rounded-xl font-semibold transition ${getButtonColor()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
