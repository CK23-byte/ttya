/**
 * Simple Emoji Picker Component
 *
 * Lightweight emoji picker without external dependencies
 */

import { useState } from 'react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥'],
  'Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '😍', '🥰', '😘', '💋', '💑', '💏'],
  'Gestures': ['👋', '🤚', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'People': ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳', '👩‍🦲', '👨‍🦲', '👱‍♀️', '👱‍♂️', '🧔', '👸', '🤴', '👰', '🤵'],
  'Nature': ['🌸', '💮', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌍', '🌎', '🌏', '🌕', '⭐', '🌟', '✨', '☀️', '🌈', '☁️'],
  'Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🍜', '🍝', '🍣', '🍰', '🎂', '🍪', '☕'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎯', '🎮', '🎲'],
  'Objects': ['💼', '📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📞', '☎️', '📺', '📻', '🎙️', '⏰', '⌚', '💡', '🔦', '🕯️', '📚', '📖', '✏️', '📝', '✉️', '📬'],
  'Symbols': ['💯', '🔥', '✅', '❌', '❓', '❗', '💤', '💢', '💬', '👁️‍🗨️', '🗯️', '💭', '🕳️', '👁️', '👀', '🦴', '🦷', '👅', '👄', '🧠', '🦾', '🦿', '👣', '🩸', '💉', '🩹', '🩺', '💊', '🔬', '🔭'],
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Smileys')

  const categories = Object.keys(EMOJI_CATEGORIES)
  const categoryIcons: Record<string, string> = {
    'Smileys': '😀',
    'Love': '❤️',
    'Gestures': '👋',
    'People': '👤',
    'Nature': '🌸',
    'Food': '🍎',
    'Activities': '⚽',
    'Objects': '💼',
    'Symbols': '💯',
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-[#1f2c34] rounded-xl shadow-xl border border-gray-700 w-72 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm text-gray-300">Emoji</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex px-2 py-1 border-b border-gray-700 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`p-2 text-lg hover:bg-gray-700/50 rounded transition ${
              activeCategory === cat ? 'bg-gray-700' : ''
            }`}
            title={cat}
          >
            {categoryIcons[cat]}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="h-48 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(emoji)
                onClose()
              }}
              className="text-xl p-1.5 hover:bg-gray-700/50 rounded transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
