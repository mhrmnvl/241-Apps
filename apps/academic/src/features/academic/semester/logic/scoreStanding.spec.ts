import { describe, expect, it } from 'vitest'
import { scoreStanding } from './scoreStanding'

describe('scoreStanding', () => {
  it('compares against the school’s mark, not a fixed one', () => {
    // 74 passes a school whose KKM is 70 and fails one whose KKM is 75. The
    // hardcoded 75 this replaces got the first case wrong every time.
    expect(scoreStanding(74, 70)).toBe('at-or-above')
    expect(scoreStanding(74, 75)).toBe('below')
  })

  it('counts the mark itself as passing', () => {
    expect(scoreStanding(75, 75)).toBe('at-or-above')
  })

  /**
   * A student whose report card has not been finalised has no average.
   * Painting that amber would read as a warning about a child nobody has
   * marked yet.
   */
  it('says nothing about a student with no average', () => {
    expect(scoreStanding(null, 75)).toBe('unknown')
    expect(scoreStanding(undefined, 75)).toBe('unknown')
  })

  it('says nothing when the school’s mark has not arrived', () => {
    expect(scoreStanding(80, null)).toBe('unknown')
    expect(scoreStanding(80, undefined)).toBe('unknown')
  })

  /** Zero is a mark, not a missing one. */
  it('treats a zero average as a real score', () => {
    expect(scoreStanding(0, 75)).toBe('below')
  })
})
