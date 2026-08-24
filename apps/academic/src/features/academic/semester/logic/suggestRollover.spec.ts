import { describe, expect, it } from 'vitest'
import { suggestRollover } from './suggestRollover'
import type { Semester } from '../types'

function semester(
  id: string,
  academicYearId: string,
  enrollments?: number,
): Semester {
  return {
    id,
    academicYearId,
    typeId: `type-${id}`,
    type: { id: `type-${id}`, name: 'ODD' },
    isActive: false,
    ...(enrollments === undefined
      ? {}
      : { _count: { enrollments, teachingAssignments: 0 } }),
  }
}

describe('suggestRollover', () => {
  const ganjil = semester('ganjil', 'ay-2026', 186)
  const genap = semester('genap', 'ay-2026', 0)

  it('offers the sibling that has the data', () => {
    const suggestion = suggestRollover(genap, [ganjil, genap])

    expect(suggestion?.source.id).toBe('ganjil')
    expect(suggestion?.target.id).toBe('genap')
  })

  /** The ordinary case: a term activated because it is already in use. */
  it('stays quiet when the activated term already holds enrolments', () => {
    expect(suggestRollover(ganjil, [ganjil, genap])).toBeNull()
  })

  it('stays quiet when there is nothing to copy from', () => {
    const empty = semester('ganjil', 'ay-2026', 0)
    expect(suggestRollover(genap, [empty, genap])).toBeNull()
  })

  /**
   * Offering to fill a term that already holds a year of marks is a worse
   * mistake than staying quiet, so an absent count is not read as zero.
   */
  it('stays quiet when the count did not arrive', () => {
    const unknown = semester('genap', 'ay-2026')
    expect(suggestRollover(unknown, [ganjil, unknown])).toBeNull()
  })

  it('does not reach into another academic year', () => {
    const lastYear = semester('genap-2025', 'ay-2025', 180)
    expect(suggestRollover(genap, [lastYear, genap])).toBeNull()
  })

  /** Two candidates is a question. A third term should be asked about. */
  it('stays quiet when more than one sibling could be the source', () => {
    const first = semester('t1', 'ay-2026', 100)
    const second = semester('t2', 'ay-2026', 100)

    expect(suggestRollover(genap, [first, second, genap])).toBeNull()
  })

  it('has nothing to say about nothing', () => {
    expect(suggestRollover(null, [ganjil])).toBeNull()
    expect(suggestRollover(undefined, [ganjil])).toBeNull()
  })
})
