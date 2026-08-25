import { describe, expect, it } from 'vitest'
import {
  CELL_PADDING_MM,
  PAGE_MARGIN_MM,
  PAPER_SIZES,
  columnChoicesFor,
  labelSheetLayout,
  paginateLabels,
  paperById,
} from './labelSheetLayout'

/** Every paper × column pair the screen can actually produce. */
const EVERY_COMBINATION = PAPER_SIZES.flatMap((paper) =>
  columnChoicesFor(paper.id).map((columns) => [paper.id, columns] as const),
)

describe('labelSheetLayout', () => {
  /**
   * The property the whole module exists for. A page that measures taller than
   * the paper is how a label — or the dashed guide beside it — ends up across a
   * boundary, which is the defect this replaced.
   */
  it.each(EVERY_COMBINATION)(
    '%s at %i columns fills the page without overflowing it',
    (paperId, columns) => {
      const layout = labelSheetLayout(paperId, columns)
      const printableHeight = layout.paper.heightMm - PAGE_MARGIN_MM * 2

      expect(layout.rowsPerPage * layout.cellHeightMm).toBeLessThanOrEqual(
        printableHeight,
      )
    },
  )

  /** And is not so cautious that it wastes a row. */
  it.each(EVERY_COMBINATION)(
    '%s at %i columns leaves less than one row spare',
    (paperId, columns) => {
      const layout = labelSheetLayout(paperId, columns)
      const printableHeight = layout.paper.heightMm - PAGE_MARGIN_MM * 2
      const spare = printableHeight - layout.rowsPerPage * layout.cellHeightMm

      expect(spare).toBeLessThan(layout.cellHeightMm)
    },
  )

  /**
   * The logo and the QR are square, so their width follows the label's height
   * — and the height has a floor. Left uncapped, a narrow label reached the
   * point where the two squares were wider than the label containing them.
   */
  it.each(EVERY_COMBINATION)(
    '%s at %i columns leaves room for text between the logo and the QR',
    (paperId, columns) => {
      const layout = labelSheetLayout(paperId, columns)
      const squares = layout.squareMm * 2

      // Not merely positive: the text column is what the label is for.
      expect(layout.labelWidthMm - squares).toBeGreaterThan(
        layout.labelWidthMm * 0.3,
      )
    },
  )

  it('counts a cell as the label plus the padding around it', () => {
    const layout = labelSheetLayout('a4', 3)

    expect(layout.cellHeightMm).toBe(layout.labelHeightMm + CELL_PADDING_MM * 2)
  })

  /** Bigger paper is the reason to reach for it. */
  it('fits more labels on A3 than on A4 at the same column count', () => {
    expect(labelSheetLayout('a3', 4).labelsPerPage).toBeGreaterThan(
      labelSheetLayout('a4', 4).labelsPerPage,
    )
  })

  it('gives more labels per page as the columns grow', () => {
    expect(labelSheetLayout('a4', 5).labelsPerPage).toBeGreaterThan(
      labelSheetLayout('a4', 2).labelsPerPage,
    )
  })

  /**
   * Narrow paper at many columns is where a label would otherwise shrink to
   * nothing; the floor keeps the QR scannable and the caller sees a label that
   * is too wide for the page rather than one that is unreadable.
   */
  it('never lets a label fall below the readable floor', () => {
    for (const [paperId, columns] of EVERY_COMBINATION) {
      expect(
        labelSheetLayout(paperId, columns).labelHeightMm,
      ).toBeGreaterThanOrEqual(16)
    }
  })

  it('always fits at least one row', () => {
    expect(labelSheetLayout('a5', 8).rowsPerPage).toBeGreaterThanOrEqual(1)
  })
})

describe('columnChoicesFor', () => {
  /** Most of the reason to reach for A3 in the first place. */
  it('offers more columns on bigger paper', () => {
    expect(columnChoicesFor('a3').length).toBeGreaterThan(
      columnChoicesFor('a4').length,
    )
    expect(columnChoicesFor('a4').length).toBeGreaterThan(
      columnChoicesFor('a5').length,
    )
  })

  it('offers only counts that leave a usable label', () => {
    for (const paper of PAPER_SIZES) {
      for (const columns of columnChoicesFor(paper.id)) {
        expect(
          labelSheetLayout(paper.id, columns).labelWidthMm,
        ).toBeGreaterThanOrEqual(28)
      }
    }
  })

  it('always offers at least two across', () => {
    for (const paper of PAPER_SIZES) {
      expect(columnChoicesFor(paper.id)).toContain(2)
    }
  })

  it('is never empty, even for a paper it does not know', () => {
    expect(columnChoicesFor('tidak-ada').length).toBeGreaterThan(0)
  })

  it('falls back rather than breaking on nonsense', () => {
    expect(labelSheetLayout('tidak-ada', 3).paper.id).toBe('a4')
    expect(labelSheetLayout(undefined, 3).paper.id).toBe('a4')
    expect(labelSheetLayout('a4', 0).columns).toBe(3)
    expect(labelSheetLayout('a4', -1).columns).toBe(3)
    expect(labelSheetLayout('a4', 2.5).columns).toBe(3)
  })
})

describe('paperById', () => {
  it('finds a paper by its id', () => {
    expect(paperById('a3')).toMatchObject({ widthMm: 297, heightMm: 420 })
  })

  it('falls back to A4 for anything it does not know', () => {
    expect(paperById('foolscap').id).toBe('a4')
    expect(paperById(undefined).id).toBe('a4')
  })

  it('has no duplicate ids to be ambiguous about', () => {
    const ids = PAPER_SIZES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
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
