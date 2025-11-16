// Message types
export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: number
  status?: 'sending' | 'sent' | 'error'
}

// Personality profile types
export interface PersonalityProfile {
  id: string
  name: string
  relationship: string
  birthDate?: string
  dateSince?: string
  photoUrl?: string
  typicalPhrases: string[]
  hobbies: string[]
  habits: string[]
  humorStyle: string
  traits: string[]
  tone: 'formal' | 'informal' | 'playful' | 'serious'
  emojiUsage: 'high' | 'medium' | 'low' | 'none'
  systemPrompt: string
  createdAt: number
  updatedAt: number
}

// Memory types
export interface WhatsAppMessage {
  date: string
  time: string
  sender: string
  content: string
}

export interface PhotoMemory {
  id: string
  base64Data: string
  caption?: string
  timestamp: number
}

export interface AudioMemory {
  id: string
  base64Data: string
  note: string
  duration: number
  timestamp: number
}

export interface MemoryCollection {
  whatsappMessages: WhatsAppMessage[]
  photos: PhotoMemory[]
  audioClips: AudioMemory[]
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean
  encryptionKey: CryptoKey | null
  lastActivity: number
}

// Video call types
export type CallState = 'idle' | 'ringing' | 'connected' | 'ended'

export interface CallLog {
  id: string
  timestamp: number
  duration: number
  personalityId: string
}
