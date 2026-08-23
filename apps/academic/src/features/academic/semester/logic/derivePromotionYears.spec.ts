import { describe, expect, it } from 'vitest'
import { derivePromotionYears } from './derivePromotionYears'
import type { AcademicYearRef } from '../types'

const year = (
  name: string,
  startYear: number,
  isActive = false,
): AcademicYearRef => ({ id: name, name, startYear, isActive })

describe('derivePromotionYears', () => {
  it('runs from the year the school is in into the one after it', () => {
    const { source, target } = derivePromotionYears([
      year('2026/2027', 2026, true),
      year('2027/2028', 2027),
    ])

    expect(source?.name).toBe('2026/2027')
    expect(target?.name).toBe('2027/2028')
  })

  it('finds them whatever order the list arrives in', () => {
    const { source, target } = derivePromotionYears([
      year('2027/2028', 2027),
      year('2025/2026', 2025),
      year('2026/2027', 2026, true),
    ])

    expect(source?.name).toBe('2026/2027')
    expect(target?.name).toBe('2027/2028')
  })

  /**
   * The reason `startYear` was added. Ordering on the name works right up until
   * somebody renames a year, and then it moves a cohort silently.
   */
  it('does not depend on how the years are named', () => {
    const odd = [
      { id: 'a', name: 'TA Berjalan', startYear: 2026, isActive: true },
      { id: 'b', name: 'Tahun Depan', startYear: 2027, isActive: false },
    ]

    const { source, target } = derivePromotionYears(odd)

    expect(source?.name).toBe('TA Berjalan')
    expect(target?.name).toBe('Tahun Depan')
  })

  /**
   * A gap is not a promotion. Quietly reaching past it into 2030/2031 would be
   * a worse answer than saying the year after does not exist yet.
   */
  it('offers no target across a gap in the years', () => {
    const { source, target } = derivePromotionYears([
      year('2026/2027', 2026, true),
      year('2030/2031', 2030),
    ])

    expect(source?.name).toBe('2026/2027')
    expect(target).toBeNull()
  })

  it('offers no target when the next year has not been created', () => {
    const { target } = derivePromotionYears([year('2026/2027', 2026, true)])
    expect(target).toBeNull()
  })

  it('has nothing to offer when no year is active', () => {
    const { source, target } = derivePromotionYears([
      year('2026/2027', 2026),
      year('2027/2028', 2027),
    ])

    expect(source).toBeNull()
    expect(target).toBeNull()
  })

  /** Older records predate the column; they simply cannot be ordered. */
  it('gives up on a target when the active year has no start year', () => {
    const { source, target } = derivePromotionYears([
      { id: 'a', name: '2026/2027', isActive: true },
      year('2027/2028', 2027),
    ])

    expect(source?.name).toBe('2026/2027')
    expect(target).toBeNull()
  })
})
