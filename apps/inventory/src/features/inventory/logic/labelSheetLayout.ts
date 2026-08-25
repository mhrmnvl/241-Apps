/**
 * How many labels fit on one page, worked out rather than discovered.
 *
 * Everything here exists because letting the browser decide kept going wrong.
 * A label, or the dashed guide beside it, would land across a page boundary —
 * the browser fragmenting a grid at whatever point the content happened to
 * reach, with `break-inside: avoid` treated as a hint. Fixing one symptom moved
 * the problem rather than removing it.
 *
 * So the sheet no longer relies on fragmentation at all. Every label is a known
 * height, the number of rows that fit in the printable area is arithmetic, and
 * the units are cut into explicit pages before anything is rendered. A page
 * break happens where this module says it does.
 *
 * The heights and the counts come from the same numbers, so the CSS and the
 * chunking cannot drift apart — which is the failure this would otherwise
 * invite the next time somebody adjusts a label.
 */

export interface PaperSize {
  id: string
  /** What the operator picks it by. */
  label: string
  widthMm: number
  heightMm: number
}

/**
 * The papers a school actually feeds a printer.
 *
 * Given as millimetres rather than the CSS keywords `A4` / `A3` / `legal`,
 * because F4 has no keyword — and it is the one an Indonesian school reaches
 * for most. One representation for all of them beats a special case for the
 * one that matters.
 */
export const PAPER_SIZES: PaperSize[] = [
  { id: 'a4', label: 'A4 (210 × 297)', widthMm: 210, heightMm: 297 },
  { id: 'f4', label: 'F4 / Folio (215 × 330)', widthMm: 215, heightMm: 330 },
  { id: 'a3', label: 'A3 (297 × 420)', widthMm: 297, heightMm: 420 },
  { id: 'a5', label: 'A5 (148 × 210)', widthMm: 148, heightMm: 210 },
  { id: 'letter', label: 'Letter (216 × 279)', widthMm: 216, heightMm: 279 },
  { id: 'legal', label: 'Legal (216 × 356)', widthMm: 216, heightMm: 356 },
]

export const DEFAULT_PAPER_ID = 'a4'

/** Taken off every edge, and the same number `@page` is given. */
export const PAGE_MARGIN_MM = 8

/** The padding above and below the label, inside its cut guide. */
export const CELL_PADDING_MM = 3

/**
 * Never bet the last millimetre.
 *
 * Printers round, and a page that fits in theory and overflows by a hair in
 * practice costs a whole extra sheet — and puts one orphaned label on it.
 */
const SAFETY_MM = 2

/**
 * Roughly how much wider than tall a label should be.
 *
 * Derived from the width rather than looked up per paper, because the lookup
 * would need an entry for every paper and column count and would be wrong the
 * moment a new paper was added.
 */
const TARGET_ASPECT = 2.4

/** Below this the QR stops being worth scanning; above it the label is a card. */
const MIN_LABEL_HEIGHT_MM = 16
const MAX_LABEL_HEIGHT_MM = 30

/**
 * The most of a label's width the logo and the QR may each take.
 *
 * They are square, so their width follows the label's height — and the height
 * has a floor. Without this cap, a narrow label on a narrow paper reached the
 * point where the two squares were wider than the label containing them, and
 * the text between them had negative room.
 */
const MAX_SQUARE_SHARE = 0.3

/**
 * Narrower than this and there is nothing useful left between the logo and the
 * QR. Used to decide which column counts a paper can actually offer, rather
 * than letting somebody pick one that prints unreadable labels.
 */
const MIN_LABEL_WIDTH_MM = 28

/** Nobody hand-cuts more than eight across, even on A3. */
const MAX_COLUMNS = 8

const DEFAULT_COLUMNS = 3

export interface LabelSheetLayout {
  paper: PaperSize
  columns: number
  /** Width of one label, excluding the padding inside its cut guide. */
  labelWidthMm: number
  labelHeightMm: number
  /**
   * The side of the square logo and QR cells.
   *
   * As tall as the label allows, but never so wide that the two of them crowd
   * out the text between them.
   */
  squareMm: number
  /** The label plus its padding — the box that tiles and that breaks pages. */
  cellHeightMm: number
  rowsPerPage: number
  /** `rowsPerPage * columns` — the answer the whole module exists to give. */
  labelsPerPage: number
}

export function paperById(id: string | undefined): PaperSize {
  return (
    PAPER_SIZES.find((paper) => paper.id === id) ??
    PAPER_SIZES.find((paper) => paper.id === DEFAULT_PAPER_ID)!
  )
}

export function labelSheetLayout(
  paperId: string | undefined,
  columns: number,
): LabelSheetLayout {
  const paper = paperById(paperId)
  const resolvedColumns =
    Number.isInteger(columns) && columns >= 1 ? columns : DEFAULT_COLUMNS

  const printableWidth = paper.widthMm - PAGE_MARGIN_MM * 2
  const printableHeight = paper.heightMm - PAGE_MARGIN_MM * 2

  const labelWidthMm = printableWidth / resolvedColumns - CELL_PADDING_MM * 2

  // Whole millimetres: a label measured to three decimal places is a label
  // nobody can check with a ruler.
  const labelHeightMm = Math.min(
    MAX_LABEL_HEIGHT_MM,
    Math.max(MIN_LABEL_HEIGHT_MM, Math.round(labelWidthMm / TARGET_ASPECT)),
  )

  const squareMm = Math.min(labelHeightMm, labelWidthMm * MAX_SQUARE_SHARE)

  const cellHeightMm = labelHeightMm + CELL_PADDING_MM * 2

  // Floor, not round: a row that half fits does not fit.
  const rowsPerPage = Math.max(
    1,
    Math.floor((printableHeight - SAFETY_MM) / cellHeightMm),
  )

  return {
    paper,
    columns: resolvedColumns,
    labelWidthMm,
    labelHeightMm,
    squareMm,
    cellHeightMm,
    rowsPerPage,
    labelsPerPage: rowsPerPage * resolvedColumns,
  }
}

/**
 * The column counts a paper can print a usable label at.
 *
 * A4 stops at five across and A3 goes to eight, which is most of the reason to
 * reach for A3 in the first place. Offering every count on every paper would
 * mean offering some that produce a label with no room for its own text —
 * easier to leave out of the list than to explain afterwards.
 */
export function columnChoicesFor(paperId: string | undefined): number[] {
  const choices: number[] = []
  for (let columns = 2; columns <= MAX_COLUMNS; columns++) {
    if (labelSheetLayout(paperId, columns).labelWidthMm >= MIN_LABEL_WIDTH_MM) {
      choices.push(columns)
    }
  }
  // Every paper here is wide enough for two; the fallback is for one that
  // somehow is not, so the select is never empty.
  return choices.length > 0 ? choices : [2]
}

/**
 * Cuts the units into pages of exactly `size`.
 *
 * The last page is short, which is the only page allowed to be.
 */
export function paginateLabels<T>(units: T[], size: number): T[][] {
  if (size < 1) return units.length > 0 ? [units] : []

  const pages: T[][] = []
  for (let i = 0; i < units.length; i += size) {
    pages.push(units.slice(i, i + size))
  }
  return pages
}
