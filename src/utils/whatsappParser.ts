/**
 * WhatsApp Export Parser
 *
 * Parses WhatsApp chat exports (.txt format)
 */

import { WhatsAppMessage } from '../types'

/**
 * Parse WhatsApp export text file
 * Supports common WhatsApp export formats
 */
export function parseWhatsAppExport(text: string): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = []
  const lines = text.split('\n')

  // Common WhatsApp patterns:
  // [DD/MM/YYYY, HH:MM:SS] Name: Message
  // DD/MM/YYYY, HH:MM - Name: Message
  // DD-MM-YYYY HH:MM - Name: Message
  const patterns = [
    /\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.+)/,
    /(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.+)/,
    /(\d{1,2}-\d{1,2}-\d{2,4})\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.+)/,
  ]

  for (const line of lines) {
    if (!line.trim()) continue

    let matched = false
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const [, date, time, sender, content] = match
        messages.push({
          date: date.trim(),
          time: time.trim(),
          sender: sender.trim(),
          content: content.trim(),
        })
        matched = true
        break
      }
    }

    // If not matched, it might be a continuation of previous message
    if (!matched && messages.length > 0) {
      messages[messages.length - 1].content += '\n' + line
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
