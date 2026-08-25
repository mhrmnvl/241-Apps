import { describe, expect, it } from 'vitest'
import {
  CELL_PADDING_MM,
  LABEL_SIZES,
  PAGE_MARGIN_MM,
  PAPER_SIZES,
  SAFETY_MM,
  labelSheetLayout,
  labelSizeById,
  paginateLabels,
  paperById,
} from './labelSheetLayout'

/** Every paper × label size pair the screens can produce. */
const EVERY_COMBINATION = PAPER_SIZES.flatMap((paper) =>
  LABEL_SIZES.map((size) => [paper.id, size.id] as const),
)

const printable = (paperId: string) => {
  const paper = paperById(paperId)
  return {
    widthMm: paper.widthMm - PAGE_MARGIN_MM * 2,
    heightMm: paper.heightMm - PAGE_MARGIN_MM * 2,
  }
}

describe('labelSheetLayout — a label is the same object on any paper', () => {
  /**
   * The property this module was rebuilt around. A sticker that came out
   * bigger on A3 than on A4 would be a different sticker for the same asset,
   * decided by whatever paper happened to be in the tray.
   */
  it.each(LABEL_SIZES.map((s) => s.id))(
    '%s measures the same on every paper',
    (sizeId) => {
      const widths = new Set(
        PAPER_SIZES.map(
          (paper) => labelSheetLayout(paper.id, sizeId).size.widthMm,
        ),
      )
      const heights = new Set(
        PAPER_SIZES.map(
          (paper) => labelSheetLayout(paper.id, sizeId).size.heightMm,
        ),
      )

      expect(widths.size).toBe(1)
      expect(heights.size).toBe(1)
    },
  )

  /** Bigger paper is the reason to reach for it. */
  it.each(LABEL_SIZES.map((s) => s.id))(
    'fits more %s labels on A3 than on A4',
    (sizeId) => {
      expect(labelSheetLayout('a3', sizeId).labelsPerPage).toBeGreaterThan(
        labelSheetLayout('a4', sizeId).labelsPerPage,
      )
    },
  )
})

describe('labelSheetLayout — nothing overflows the page', () => {
  it.each(EVERY_COMBINATION)(
    '%s / %s stays inside the width',
    (paperId, sizeId) => {
      const layout = labelSheetLayout(paperId, sizeId)

      expect(layout.columns * layout.cellWidthMm).toBeLessThanOrEqual(
        printable(paperId).widthMm,
      )
    },
  )

  it.each(EVERY_COMBINATION)(
    '%s / %s stays inside the height',
    (paperId, sizeId) => {
      const layout = labelSheetLayout(paperId, sizeId)

      expect(layout.rowsPerPage * layout.cellHeightMm).toBeLessThanOrEqual(
        printable(paperId).heightMm,
      )
    },
  )

  /**
   * And is not so cautious that it wastes a row or a column.
   *
   * Measured against the budget the calculation actually targets — the
   * printable area less the safety millimetres — because that cushion is
   * deliberate and a row it costs is not waste.
   */
  it.each(EVERY_COMBINATION)('%s / %s wastes neither', (paperId, sizeId) => {
    const layout = labelSheetLayout(paperId, sizeId)
    const { widthMm, heightMm } = printable(paperId)

    expect(widthMm - layout.columns * layout.cellWidthMm).toBeLessThan(
      layout.cellWidthMm,
    )
    expect(
      heightMm - SAFETY_MM - layout.rowsPerPage * layout.cellHeightMm,
    ).toBeLessThan(layout.cellHeightMm)
  })

  /** Even the largest label has to fit the smallest paper on offer. */
  it.each(EVERY_COMBINATION)(
    '%s / %s fits at least one across',
    (paperId, sizeId) => {
      const layout = labelSheetLayout(paperId, sizeId)

      expect(layout.cellWidthMm).toBeLessThanOrEqual(printable(paperId).widthMm)
      expect(layout.columns).toBeGreaterThanOrEqual(1)
    },
  )
})

describe('labelSheetLayout — the label itself', () => {
  it('counts a cell as the label plus the padding around it', () => {
    const layout = labelSheetLayout('a4', 'md')

    expect(layout.cellWidthMm).toBe(layout.size.widthMm + CELL_PADDING_MM * 2)
    expect(layout.cellHeightMm).toBe(layout.size.heightMm + CELL_PADDING_MM * 2)
  })

  /**
   * The number and the name are what somebody reads off a cupboard; the logo
   * only says whose it is. With a QR beside it too, a 58mm label was left with
   * 23mm of text; without one it has 42mm.
   */
  it.each(LABEL_SIZES.map((s) => s.id))(
    '%s gives the text two thirds of the label',
    (sizeId) => {
      const layout = labelSheetLayout('a4', sizeId)

      expect(layout.textWidthMm).toBeGreaterThan(layout.size.widthMm * 0.66)
    },
  )

  /** The logo is square, so it can never be taller than the label. */
  it.each(LABEL_SIZES.map((s) => s.id))(
    '%s keeps its logo square and inside',
    (sizeId) => {
      const layout = labelSheetLayout('a4', sizeId)

      expect(layout.logoMm).toBeGreaterThan(0)
      expect(layout.logoMm).toBeLessThanOrEqual(layout.size.heightMm)
    },
  )

  /**
   * The defect that started this: 7pt of type on a 30mm label and on a 14mm
   * one alike. Type now grows with the label it sits on.
   */
  it('sizes the type from the label rather than fixing it', () => {
    const sizes = LABEL_SIZES.map(
      (s) => labelSheetLayout('a4', s.id).numberFontMm,
    )

    // LABEL_SIZES runs largest to smallest, so the fonts must too.
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
    expect(new Set(sizes).size).toBe(sizes.length)
  })

  it.each(LABEL_SIZES.map((s) => s.id))(
    '%s sets the number larger than the name, and both readably',
    (sizeId) => {
      const layout = labelSheetLayout('a4', sizeId)

      expect(layout.numberFontMm).toBeGreaterThan(layout.nameFontMm)
      // 1.6mm is about 4.5pt — small, but on a 32mm sticker read up close.
      expect(layout.nameFontMm).toBeGreaterThanOrEqual(1.6)
    },
  )

  /** Two lines of name and one of number have to fit the label's height. */
  it.each(LABEL_SIZES.map((s) => s.id))(
    '%s fits its type vertically',
    (sizeId) => {
      const layout = labelSheetLayout('a4', sizeId)
      const stacked = (layout.numberFontMm + layout.nameFontMm * 2) * 1.15

      expect(stacked).toBeLessThanOrEqual(layout.size.heightMm)
    },
  )

  /** A4 still lays out the way it always did, which is the point. */
  it.each([
    ['lg', 2],
    ['md', 3],
    ['sm', 4],
    ['xs', 5],
  ] as const)('lays %s out %i across on A4', (sizeId, columns) => {
    expect(labelSheetLayout('a4', sizeId).columns).toBe(columns)
  })
})

describe('lookups', () => {
  it('finds a paper and a label size by id', () => {
    expect(paperById('a3')).toMatchObject({ widthMm: 297, heightMm: 420 })
    expect(labelSizeById('lg')).toMatchObject({ widthMm: 91, heightMm: 30 })
  })

  it('falls back rather than breaking on anything unknown', () => {
    expect(paperById('foolscap').id).toBe('a4')
    expect(paperById(undefined).id).toBe('a4')
    expect(labelSizeById('raksasa').id).toBe('md')
    expect(labelSizeById(undefined).id).toBe('md')
    expect(labelSheetLayout('tidak-ada', 'tidak-ada').paper.id).toBe('a4')
  })

  it('has no duplicate ids to be ambiguous about', () => {
    const paperIds = PAPER_SIZES.map((p) => p.id)
    const sizeIds = LABEL_SIZES.map((s) => s.id)

    expect(new Set(paperIds).size).toBe(paperIds.length)
    expect(new Set(sizeIds).size).toBe(sizeIds.length)
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
