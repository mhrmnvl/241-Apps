/**
 * How many labels fit on one page, worked out rather than discovered.
 *
 * Two things this module is built around.
 *
 * **A label is a physical object.** It gets stuck on a cupboard and read from
 * arm's length, so its size is chosen once and does not move. Paper decides how
 * many of them fit on a sheet and nothing else — print the same asset on A4 or
 * on A3 and the sticker that comes off the guillotine is the same sticker. The
 * sizes here are the ones A4 has always produced, so nothing that was printed
 * before changes size now.
 *
 * **Nothing is left to the browser to decide.** Automatic fragmentation kept
 * putting a label — or the dashed guide beside it — across a page boundary: a
 * grid broken at whatever point the content happened to reach, with
 * `break-inside: avoid` treated as a hint. Every label is a known size, the
 * rows and columns that fit are arithmetic, and the units are cut into explicit
 * pages before anything is rendered.
 *
 * The CSS reads these same numbers back as custom properties, so what a label
 * is drawn at and what it was counted as cannot drift apart.
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

export interface LabelSize {
  id: string
  label: string
  widthMm: number
  heightMm: number
}

/**
 * The four label sizes, in millimetres of actual sticker.
 *
 * These are what A4 produced when the sheet was described as "2 / baris"
 * through "5 / baris" — the counts are gone because they stopped being true
 * the moment a second paper existed, but the sizes they made are kept exactly.
 * On A4 the sheet still lays out two, three, four or five across.
 */
export const LABEL_SIZES: LabelSize[] = [
  { id: 'lg', label: 'Besar (91 × 30 mm)', widthMm: 91, heightMm: 30 },
  { id: 'md', label: 'Sedang (58 × 24 mm)', widthMm: 58, heightMm: 24 },
  { id: 'sm', label: 'Kecil (42 × 18 mm)', widthMm: 42, heightMm: 18 },
  { id: 'xs', label: 'Mini (32 × 14 mm)', widthMm: 32, heightMm: 14 },
]

export const DEFAULT_LABEL_SIZE_ID = 'md'

/** Taken off every edge, and the same number `@page` is given. */
export const PAGE_MARGIN_MM = 8

/** The padding around the label, inside its cut guide. */
export const CELL_PADDING_MM = 3

/**
 * Never bet the last millimetre.
 *
 * Printers round, and a page that fits in theory and overflows by a hair in
 * practice costs a whole extra sheet — and puts one orphaned label on it.
 */
export const SAFETY_MM = 2

/**
 * The most of a label's width the logo and the QR may each take.
 *
 * They are square, so their width follows the label's height. Uncapped, the two
 * of them came out wider than a short wide label containing them, and the text
 * between them had negative room. At 30% each the text column always keeps 40%.
 */
const MAX_SQUARE_SHARE = 0.3

export interface LabelSheetLayout {
  paper: PaperSize
  size: LabelSize
  /** The label plus the padding around it — the box that tiles. */
  cellWidthMm: number
  cellHeightMm: number
  /** The side of the square logo and QR cells. */
  squareMm: number
  columns: number
  rowsPerPage: number
  /** `columns * rowsPerPage` — the answer the whole module exists to give. */
  labelsPerPage: number
}

export function paperById(id: string | undefined): PaperSize {
  return (
    PAPER_SIZES.find((paper) => paper.id === id) ??
    PAPER_SIZES.find((paper) => paper.id === DEFAULT_PAPER_ID)!
  )
}

export function labelSizeById(id: string | undefined): LabelSize {
  return (
    LABEL_SIZES.find((size) => size.id === id) ??
    LABEL_SIZES.find((size) => size.id === DEFAULT_LABEL_SIZE_ID)!
  )
}

export function labelSheetLayout(
  paperId: string | undefined,
  labelSizeId: string | undefined,
): LabelSheetLayout {
  const paper = paperById(paperId)
  const size = labelSizeById(labelSizeId)

  const cellWidthMm = size.widthMm + CELL_PADDING_MM * 2
  const cellHeightMm = size.heightMm + CELL_PADDING_MM * 2

  const printableWidth = paper.widthMm - PAGE_MARGIN_MM * 2
  const printableHeight = paper.heightMm - PAGE_MARGIN_MM * 2

  // Floor, both ways: a row or a column that half fits does not fit. The floor
  // of at least one is for a label wider than the paper — it would overflow,
  // but printing one and seeing it is more use than printing nothing.
  const columns = Math.max(1, Math.floor(printableWidth / cellWidthMm))
  const rowsPerPage = Math.max(
    1,
    Math.floor((printableHeight - SAFETY_MM) / cellHeightMm),
  )

  const squareMm = Math.min(size.heightMm, size.widthMm * MAX_SQUARE_SHARE)

  return {
    paper,
    size,
    cellWidthMm,
    cellHeightMm,
    squareMm,
    columns,
    rowsPerPage,
    labelsPerPage: columns * rowsPerPage,
  }
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
