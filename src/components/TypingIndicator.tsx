/**
 * Typing Indicator Component
 *
 * Animated dots showing AI is typing
 * Smaller, more realistic dots
 */

export default function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center">
      <div
        className="w-1.5 h-1.5 bg-current opacity-60 rounded-full animate-bounce"
        style={{ animationDelay: '0ms', animationDuration: '600ms' }}
      />
      <div
        className="w-1.5 h-1.5 bg-current opacity-60 rounded-full animate-bounce"
        style={{ animationDelay: '150ms', animationDuration: '600ms' }}
      />
      <div
        className="w-1.5 h-1.5 bg-current opacity-60 rounded-full animate-bounce"
        style={{ animationDelay: '300ms', animationDuration: '600ms' }}
      />
    </div>
  )
}
