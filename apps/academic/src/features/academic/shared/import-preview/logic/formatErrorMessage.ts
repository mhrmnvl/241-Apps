import type { ImportColumnDescriptor } from '../types'

/**
 * Cleans up a raw backend validation error string for display: strips the
 * technical prefix, substitutes each column's domain field name for its
 * `messageLabel` (if any), translates generic validation phrasing to
 * Indonesian, and de-duplicates repeated lines.
 *
 * The phrase dictionary below is domain-agnostic on purpose — it only knows
 * generic backend validation patterns (required, invalid email, min length,
 * ...), never field names. Field-name vocabulary comes from `descriptors`.
 */
export function formatErrorMessage(
  error: string | undefined,
  descriptors: ImportColumnDescriptor[],
): string {
  if (!error) return ''
  let msg = error

  msg = msg.replace(/^Validation failed:\s*/i, '')

  for (const descriptor of descriptors) {
    if (!descriptor.messageLabel) continue
    const pattern = new RegExp(`\\b${escapeRegExp(descriptor.key)}\\b`, 'gi')
    msg = msg.replace(pattern, descriptor.messageLabel)
  }

  msg = msg.replace(
    /must be a valid ISO 8601 date string/gi,
    'harus berupa tanggal yang valid',
  )
  msg = msg.replace(/a valid ISO 8601 date string/gi, 'tanggal yang valid')
  msg = msg.replace(/must be a valid email/gi, 'harus berupa email yang valid')
  msg = msg.replace(/must be an email/gi, 'harus berupa email yang valid')
  msg = msg.replace(/an email/gi, 'email yang valid')
  msg = msg.replace(
    /must contain only numbers or \+/gi,
    'hanya boleh berisi angka atau +',
  )
  msg = msg.replace(
    /must be one of the following values:\s*MALE(,\s*FEMALE)?/gi,
    'harus Laki-laki atau Perempuan',
  )
  msg = msg.replace(
    /must be one of the following values:\s*/gi,
    'harus salah satu dari: ',
  )
  msg = msg.replace(
    /must be longer than or equal to (\d+) characters/gi,
    'harus minimal $1 karakter',
  )
  msg = msg.replace(
    /longer than or equal to (\d+) characters/gi,
    'minimal $1 karakter',
  )
  msg = msg.replace(/should not be empty/gi, 'tidak boleh kosong')
  msg = msg.replace(
    /is duplicated in this file \(row (\d+)\)/gi,
    'ganda di berkas ini (baris $1)',
  )
  msg = msg.replace(/is already registered/gi, 'sudah terdaftar di sistem')
  msg = msg.replace(/is already taken/gi, 'sudah digunakan')
  msg = msg.replace(/is required/gi, 'wajib diisi')
  msg = msg.replace(/must be/gi, 'harus berupa')

  msg = msg.replace(/\bmale\b/gi, 'Laki-laki')
  msg = msg.replace(/\bfemale\b/gi, 'Perempuan')

  const lines = msg.split(';').map((l) => l.trim())
  const uniqueLines = Array.from(new Set(lines)).filter(Boolean)
  const formattedLines = uniqueLines.map(
    (line) => line.charAt(0).toUpperCase() + line.slice(1),
  )

  return formattedLines.join('; ')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
