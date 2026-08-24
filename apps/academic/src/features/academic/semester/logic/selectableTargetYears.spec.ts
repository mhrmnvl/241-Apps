import { describe, expect, it } from 'vitest'
import { selectableTargetYears } from './selectableTargetYears'
import type { AcademicYearRef } from '../types'

const year = (name: string, startYear?: number): AcademicYearRef => ({
  id: name,
  name,
  ...(startYear === undefined ? {} : { startYear }),
})

const y2025 = year('2025/2026', 2025)
const y2026 = year('2026/2027', 2026)
const y2027 = year('2027/2028', 2027)
const y2030 = year('2030/2031', 2030)

const names = (years: AcademicYearRef[]) => years.map((y) => y.name)

describe('selectableTargetYears', () => {
  it('offers the years that come after the source', () => {
    const offered = selectableTargetYears(
      [y2025, y2026, y2027, y2030],
      y2026.id,
    )

    expect(names(offered)).toEqual(['2027/2028', '2030/2031'])
  })

  /**
   * The defect this exists for. Promoting 2027/2028 into 2026/2027 would close
   * this year's enrolments and open new ones in a year that has already
   * finished, and nothing downstream refuses it — the server checks the grade
   * goes up, which a backward promotion still satisfies.
   */
  it('never offers a year the school has already been through', () => {
    const offered = selectableTargetYears([y2025, y2026, y2027], y2027.id)

    expect(offered).toEqual([])
  })

  it('does not offer the source year itself', () => {
    const offered = selectableTargetYears([y2026, y2027], y2026.id)

    expect(names(offered)).not.toContain('2026/2027')
  })

  /** A gap is the school's to notice; it is still forward. */
  it('offers a year further ahead when the next one was never created', () => {
    const offered = selectableTargetYears([y2026, y2030], y2026.id)

    expect(names(offered)).toEqual(['2030/2031'])
  })

  it('orders by when the year starts, not by name', () => {
    const renamed = year('A — dua ribu tiga puluh', 2030)
    const offered = selectableTargetYears([renamed, y2027, y2026], y2026.id)

    expect(names(offered)).toEqual(['2027/2028', 'A — dua ribu tiga puluh'])
  })

  /**
   * An unknown position cannot establish what comes after it, and guessing
   * would put the whole cohort somewhere nobody chose.
   */
  it('offers nothing when the source has no start year', () => {
    expect(selectableTargetYears([year('entah'), y2027], 'entah')).toEqual([])
  })

  it('skips a candidate year that has no start year', () => {
    const offered = selectableTargetYears(
      [y2026, year('entah'), y2027],
      y2026.id,
    )

    expect(names(offered)).toEqual(['2027/2028'])
  })

  it('has nothing to offer without a source', () => {
    expect(selectableTargetYears([y2026, y2027], null)).toEqual([])
    expect(selectableTargetYears([y2026, y2027], undefined)).toEqual([])
    expect(selectableTargetYears([y2026, y2027], 'tidak-ada')).toEqual([])
  })
})
