/**
 * WhatsApp Export Parser
 *
 * Parses WhatsApp chat exports (.txt format)
 * Supports multiple date/time formats from different locales
 */

import { WhatsAppMessage } from '../types'

/**
 * Parse WhatsApp export text file
 * Supports common WhatsApp export formats
 */
export function parseWhatsAppExport(text: string): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = []
  const lines = text.split('\n')

  // Common WhatsApp patterns (supporting multiple locales):
  // [DD/MM/YYYY, HH:MM:SS] Name: Message
  // [DD/MM/YY, HH:MM:SS] Name: Message
  // DD/MM/YYYY, HH:MM - Name: Message
  // DD-MM-YYYY HH:MM - Name: Message
  // [M/D/YY, H:MM:SS AM/PM] Name: Message (US format)
  // DD.MM.YY, HH:MM - Name: Message (European format)
  const patterns = [
    // Bracket formats
    /\[(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s*([^:]+?):\s*(.+)/i,
    // Non-bracket formats
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.+)/i,
    // Alternative format with em-dash
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–]\s*([^:]+?):\s*(.+)/,
  ]

  let currentMessage: WhatsAppMessage | null = null

  for (const line of lines) {
    if (!line.trim()) continue

    // Skip WhatsApp system messages
    if (line.includes('end-to-end encrypted') ||
        line.includes('Messages and calls are') ||
        line.includes('created this group') ||
        line.includes('changed the subject') ||
        line.includes('left') ||
        line.includes('was added') ||
        line.includes('joined using this')) {
      continue
    }

    let matched = false
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const [, date, time, sender, content] = match

        // Filter out empty content or system messages
        if (!content.trim() || content.trim() === '<Media omitted>') {
          matched = true
          break
        }

        currentMessage = {
          date: date.trim(),
          time: time.trim(),
          sender: sender.trim(),
          content: content.trim(),
        }
        messages.push(currentMessage)
        matched = true
        break
      }
    }

    // If not matched, it might be a continuation of previous message
    if (!matched && currentMessage) {
      currentMessage.content += '\n' + line.trim()
    }
  }

  return messages
}

/**
 * Validate if text looks like a WhatsApp export
 */
export function isValidWhatsAppExport(text: string): boolean {
  const messages = parseWhatsAppExport(text)
  return messages.length >= 5 // At least 5 messages to be valid
}

/**
 * Get unique senders from parsed messages
 */
export function getUniqueSenders(messages: WhatsAppMessage[]): string[] {
  const senders = new Set<string>()
  messages.forEach((msg) => senders.add(msg.sender))
  return Array.from(senders)
}

/**
 * Filter messages by sender
 */
export function filterBySender(
  messages: WhatsAppMessage[],
  sender: string
): WhatsAppMessage[] {
  return messages.filter((msg) => msg.sender === sender)
}

/**
 * Debug helper - analyze export format
 */
export function analyzeExportFormat(text: string): {
  totalLines: number
  sampleLines: string[]
  detectedPattern: string | null
} {
  const lines = text.split('\n').filter(l => l.trim())
  const sampleLines = lines.slice(0, 5)

  const patterns = [
    { name: 'Bracket format', regex: /\[(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\]/ },
    { name: 'Dash format', regex: /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-/ },
  ]

  let detectedPattern = null
  for (const pattern of patterns) {
    if (lines.some(line => pattern.regex.test(line))) {
      detectedPattern = pattern.name
      break
    }
  }

  return {
    totalLines: lines.length,
    sampleLines,
    detectedPattern,
  }
}
