/**
 * Typing Indicator Component
 *
 * Animated dots showing AI is typing
 */

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2 px-4">
      <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
