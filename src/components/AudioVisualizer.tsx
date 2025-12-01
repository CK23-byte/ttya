/**
 * AudioVisualizer - Visual Waveform Display for Voice Calls
 *
 * Shows animated audio visualization:
 * - Different animations for user speaking vs AI speaking
 * - Idle state when nobody is speaking
 * - Smooth transitions between states
 */

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isUserSpeaking: boolean
  isAISpeaking: boolean
  audioLevel?: number
  className?: string
}

export default function AudioVisualizer({
  isUserSpeaking,
  isAISpeaking,
  audioLevel = 0,
  className = ''
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const barsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize bars
    const barCount = 20
    if (barsRef.current.length === 0) {
      barsRef.current = Array(barCount).fill(0.1)
    }

    // Animation loop
    const animate = () => {
      const width = canvas.getBoundingClientRect().width
      const height = canvas.getBoundingClientRect().height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Calculate bar dimensions
      const barWidth = Math.floor(width / barCount) - 4
      const centerY = height / 2

      // Update bars based on speaking state
      barsRef.current = barsRef.current.map((bar, i) => {
        let target = 0.1 // Idle state

        if (isUserSpeaking || isAISpeaking) {
          // Active speaking animation
          const phase = (Date.now() / 1000) + i * 0.3
          const wave = Math.sin(phase * 2) * 0.5 + 0.5
          target = 0.3 + wave * 0.6
        } else {
          // Idle gentle pulse
          const phase = (Date.now() / 2000) + i * 0.2
          const wave = Math.sin(phase) * 0.5 + 0.5
          target = 0.1 + wave * 0.1
        }

        // Smooth transition
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        return lerp(bar, target, 0.1)
      })

      // Draw bars
      barsRef.current.forEach((intensity, i) => {
        const x = i * (barWidth + 4)
        const barHeight = intensity * height * 0.8

        // Color based on who's speaking
        let gradient
        if (isUserSpeaking) {
          // Blue for user
          gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2)
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)') // blue-500
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0.4)') // blue-600
        } else if (isAISpeaking) {
          // Orange-rose gradient for AI
          gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2)
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.8)') // orange-500
          gradient.addColorStop(1, 'rgba(244, 63, 94, 0.6)') // rose-500
        } else {
          // Gray for idle
          gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2)
          gradient.addColorStop(0, 'rgba(156, 163, 175, 0.6)') // gray-400
          gradient.addColorStop(1, 'rgba(107, 114, 128, 0.3)') // gray-500
        }

        ctx.fillStyle = gradient
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight)

        // Add rounded corners effect
        ctx.beginPath()
        ctx.arc(x + barWidth / 2, centerY - barHeight / 2, barWidth / 2, Math.PI, 0)
        ctx.arc(x + barWidth / 2, centerY + barHeight / 2, barWidth / 2, 0, Math.PI)
        ctx.closePath()
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isUserSpeaking, isAISpeaking, audioLevel])

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Speaking indicator text */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        {isUserSpeaking && (
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 text-xs font-medium animate-pulse">
            You're speaking...
          </div>
        )}
        {isAISpeaking && !isUserSpeaking && (
          <div className="px-3 py-1 bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-full text-orange-600 text-xs font-medium animate-pulse">
            AI is speaking...
          </div>
        )}
        {!isUserSpeaking && !isAISpeaking && (
          <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-500 text-xs font-medium">
            Listening...
          </div>
        )}
      </div>
    </div>
  )
}
