import { describe, it, expect } from 'vitest'
import { formatSize } from './formatSize'

describe('formatSize', () => {
  it('formats 0 bytes as "0 B"', () => {
    expect(formatSize(0)).toBe('0 B')
  })

  it('formats bytes under 1 KB in bytes', () => {
    expect(formatSize(500)).toBe('500 B')
  })

  it('converts to KB', () => {
    expect(formatSize(1536)).toBe('1.5 KB')
  })

  it('converts to MB', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2 MB')
  })

  it('converts to GB', () => {
    expect(formatSize(1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB')
  })
})
