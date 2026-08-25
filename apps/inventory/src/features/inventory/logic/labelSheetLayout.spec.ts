import { describe, expect, it } from 'vitest'
import {
  CELL_PADDING_MM,
  labelSheetLayout,
  paginateLabels,
} from './labelSheetLayout'

/** What `@page { size: A4; margin: 8mm }` leaves to print into. */
const PRINTABLE_HEIGHT_MM = 281

describe('labelSheetLayout', () => {
  /**
   * The property the whole module exists for. A page that measures taller than
   * the paper is how a label — or the dashed guide beside it — ends up across
   * a boundary, which is the defect this replaced.
   */
  it.each([2, 3, 4, 5])(
    'fills %i columns without overflowing the page',
    (columns) => {
      const layout = labelSheetLayout(columns)
      const used = layout.rowsPerPage * layout.cellHeightMm

      expect(used).toBeLessThanOrEqual(PRINTABLE_HEIGHT_MM)
    },
  )

  /** And is not so cautious that it wastes a row. */
  it.each([2, 3, 4, 5])(
    'leaves less than one row spare at %i columns',
    (columns) => {
      const layout = labelSheetLayout(columns)
      const spare =
        PRINTABLE_HEIGHT_MM - layout.rowsPerPage * layout.cellHeightMm

      expect(spare).toBeLessThan(layout.cellHeightMm)
    },
  )

  it('counts a cell as the label plus the padding around it', () => {
    const layout = labelSheetLayout(3)

    expect(layout.cellHeightMm).toBe(layout.labelHeightMm + CELL_PADDING_MM * 2)
  })

  it('gives more labels per page as the columns grow', () => {
    const two = labelSheetLayout(2).labelsPerPage
    const five = labelSheetLayout(5).labelsPerPage

    expect(five).toBeGreaterThan(two)
  })

  /** A column count nobody offers should print something, not nothing. */
  it('falls back to three columns for a count it does not know', () => {
    expect(labelSheetLayout(7).columns).toBe(3)
    expect(labelSheetLayout(0).columns).toBe(3)
    expect(labelSheetLayout(-1).columns).toBe(3)
  })

  it('always fits at least one row', () => {
    expect(labelSheetLayout(3).rowsPerPage).toBeGreaterThanOrEqual(1)
  })
})

describe('paginateLabels', () => {
  const units = Array.from({ length: 7 }, (_, i) => i + 1)

  it('cuts into pages of exactly the size given', () => {
    expect(paginateLabels(units, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  /** The last page is short; it is the only one allowed to be. */
  it('leaves the remainder on the last page', () => {
    const pages = paginateLabels(units, 3)

    expect(pages.slice(0, -1).every((p) => p.length === 3)).toBe(true)
    expect(pages.at(-1)).toHaveLength(1)
  })

  it('makes one page when everything fits', () => {
    expect(paginateLabels(units, 10)).toEqual([units])
  })

  it('has no pages for no units', () => {
    expect(paginateLabels([], 12)).toEqual([])
  })

  /** Rather than looping forever, which is the other thing a zero could do. */
  it('does not spin on a size of zero', () => {
    expect(paginateLabels(units, 0)).toEqual([units])
    expect(paginateLabels([], 0)).toEqual([])
  })
})
