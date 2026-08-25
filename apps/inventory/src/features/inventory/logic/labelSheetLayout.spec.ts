import { describe, expect, it } from 'vitest'
import {
  CELL_PADDING_MM,
  LABEL_HEIGHT_MM,
  LABEL_WIDTH_MM,
  LOGO_MM,
  NAME_FONT_MM,
  NUMBER_FONT_MM,
  PAGE_MARGIN_MM,
  PAPER_SIZES,
  SAFETY_MM,
  TEXT_WIDTH_MM,
  labelSheetLayout,
  paginateLabels,
  paperById,
} from './labelSheetLayout'

const EVERY_PAPER = PAPER_SIZES.map((paper) => paper.id)

const printable = (paperId: string) => {
  const paper = paperById(paperId)
  return {
    widthMm: paper.widthMm - PAGE_MARGIN_MM * 2,
    heightMm: paper.heightMm - PAGE_MARGIN_MM * 2,
  }
}

describe('the label is one size', () => {
  /**
   * The property this was rebuilt around. A sticker that came out bigger on A3
   * than on A4 would be a different sticker for the same asset, decided by
   * whatever paper happened to be in the tray.
   */
  it.each(EVERY_PAPER)(
    'measures the same on %s as anywhere else',
    (paperId) => {
      const layout = labelSheetLayout(paperId)

      expect(layout.cellWidthMm).toBe(LABEL_WIDTH_MM + CELL_PADDING_MM * 2)
      expect(layout.cellHeightMm).toBe(LABEL_HEIGHT_MM + CELL_PADDING_MM * 2)
    },
  )

  /** Bigger paper is the reason to reach for it. */
  it('fits more on A3 than on A4, and more on A4 than on A5', () => {
    expect(labelSheetLayout('a3').labelsPerPage).toBeGreaterThan(
      labelSheetLayout('a4').labelsPerPage,
    )
    expect(labelSheetLayout('a4').labelsPerPage).toBeGreaterThan(
      labelSheetLayout('a5').labelsPerPage,
    )
  })

  /** A4 has always held 27, and still does. */
  it('lays A4 out three across and nine down', () => {
    const layout = labelSheetLayout('a4')

    expect(layout.columns).toBe(3)
    expect(layout.rowsPerPage).toBe(9)
    expect(layout.labelsPerPage).toBe(27)
  })
})

describe('nothing overflows the page', () => {
  it.each(EVERY_PAPER)('%s stays inside the width', (paperId) => {
    const layout = labelSheetLayout(paperId)

    expect(layout.columns * layout.cellWidthMm).toBeLessThanOrEqual(
      printable(paperId).widthMm,
    )
  })

  it.each(EVERY_PAPER)('%s stays inside the height', (paperId) => {
    const layout = labelSheetLayout(paperId)

    expect(layout.rowsPerPage * layout.cellHeightMm).toBeLessThanOrEqual(
      printable(paperId).heightMm,
    )
  })

  /**
   * And is not so cautious that it wastes a row or a column. Measured against
   * the budget the calculation targets — the printable area less the safety
   * millimetres — because that cushion is deliberate.
   */
  it.each(EVERY_PAPER)('%s wastes neither a row nor a column', (paperId) => {
    const layout = labelSheetLayout(paperId)
    const { widthMm, heightMm } = printable(paperId)

    expect(widthMm - layout.columns * layout.cellWidthMm).toBeLessThan(
      layout.cellWidthMm,
    )
    expect(
      heightMm - SAFETY_MM - layout.rowsPerPage * layout.cellHeightMm,
    ).toBeLessThan(layout.cellHeightMm)
  })

  /** Even the smallest paper on offer has to take a whole label. */
  it.each(EVERY_PAPER)('%s fits at least one label', (paperId) => {
    const layout = labelSheetLayout(paperId)

    expect(layout.cellWidthMm).toBeLessThanOrEqual(printable(paperId).widthMm)
    expect(layout.cellHeightMm).toBeLessThanOrEqual(printable(paperId).heightMm)
  })
})

describe('the three parts of the label', () => {
  /** Logo on the left, the number above the name on the right. */
  it('gives the logo a sixth and the text the rest', () => {
    expect(LOGO_MM).toBeCloseTo(LABEL_WIDTH_MM * 0.15, 5)
    expect(TEXT_WIDTH_MM).toBeGreaterThan(LABEL_WIDTH_MM * 0.66)
  })

  /** Square, so it can never be taller than the label containing it. */
  it('keeps the logo square and inside the label', () => {
    expect(LOGO_MM).toBeLessThanOrEqual(LABEL_HEIGHT_MM)
    expect(LOGO_MM).toBeGreaterThan(0)
  })

  /** The number identifies the unit, so it is the one set larger. */
  it('sets the number larger than the name', () => {
    expect(NUMBER_FONT_MM).toBeGreaterThan(NAME_FONT_MM)
  })

  /**
   * Measured in millimetres of actual type, not as a fraction of the label.
   *
   * The label has vertical room to spare — the binding constraint is the
   * twenty characters of a unit number across a 46mm column, so the height it
   * could reach is beside the point. What matters is that what comes out is
   * still large enough to read: 3mm is about 8.5pt, ordinary small print.
   */
  it('sets type large enough to read at arm’s length', () => {
    expect(NUMBER_FONT_MM).toBeGreaterThanOrEqual(3)
    expect(NAME_FONT_MM).toBeGreaterThanOrEqual(2.2)
  })

  /**
   * Each takes half the label's height, less the rule between them. The number
   * gets one line of its half; the name may take two of its.
   */
  it('fits each line inside its own half', () => {
    const half = LABEL_HEIGHT_MM / 2 - 1

    expect(NUMBER_FONT_MM * 1.15).toBeLessThanOrEqual(half)
    expect(NAME_FONT_MM * 1.15 * 2).toBeLessThanOrEqual(half)
  })

  /**
   * A real unit number has to fit across, not a hopeful one.
   *
   * The format is `AST-{category}/{year}/{seq3}-{nn}`, built in
   * `create-asset.use-case.ts`. The codes in use are four characters, which
   * makes twenty — and the type was being sized against a budget of sixteen,
   * so every one of them came out truncated.
   */
  it.each([
    ['AST-ELEK/2026/001-05', 'the format in use today'],
    ['AST-MEUBEL/2026/001-05', 'a six-character category code'],
    ['AST-OLAHRAGA/2026/001-05', 'an eight-character one — the budget'],
  ])('fits %s — %s', (unitNumber) => {
    const measured = NUMBER_FONT_MM * unitNumber.length * 0.62

    // The budget case lands exactly on the line by construction, so the
    // comparison has to survive the last bit of floating point.
    expect(measured).toBeLessThanOrEqual(TEXT_WIDTH_MM + 1e-6)
  })

  /** The logo keeps its share, and the text keeps the rest. */
  it('leaves the text five sixths of the label', () => {
    expect(TEXT_WIDTH_MM).toBeGreaterThan(LABEL_WIDTH_MM * 0.75)
  })
})

describe('paperById', () => {
  it('finds a paper by its id', () => {
    expect(paperById('a3')).toMatchObject({ widthMm: 297, heightMm: 420 })
  })

  it('falls back to A4 for anything it does not know', () => {
    expect(paperById('foolscap').id).toBe('a4')
    expect(paperById(undefined).id).toBe('a4')
    expect(labelSheetLayout('tidak-ada').paper.id).toBe('a4')
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
