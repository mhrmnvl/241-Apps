/**
 * How many labels fit on one A4 page, worked out rather than discovered.
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

/** A4 is 297mm tall; `@page` takes 8mm off the top and the bottom. */
const PRINTABLE_HEIGHT_MM = 297 - 8 - 8

/**
 * Never bet the last millimetre.
 *
 * Printers round, and a page that fits in theory and overflows by a hair in
 * practice costs a whole extra sheet — and puts one orphaned label on it.
 */
const SAFETY_MM = 2

/** The 3mm of padding above and below the label, inside its cut guide. */
export const CELL_PADDING_MM = 3

/**
 * How tall a label is at each column count.
 *
 * Shorter as the columns grow, so the label keeps a shape worth printing: at
 * five per row it is a third the width it has at two, and a label that stayed
 * 28mm tall would be nearly square with a QR code taking most of it.
 */
const LABEL_HEIGHT_MM: Record<number, number> = {
  2: 28,
  3: 24,
  4: 20,
  5: 18,
}

const DEFAULT_COLUMNS = 3

export interface LabelSheetLayout {
  /** Columns actually used — an unknown count falls back rather than breaking. */
  columns: number
  /** Height of one label, excluding the padding inside its cut guide. */
  labelHeightMm: number
  /** Height of one cell: the label plus its padding, which is what tiles. */
  cellHeightMm: number
  rowsPerPage: number
  /** `rowsPerPage * columns` — the answer the whole module exists to give. */
  labelsPerPage: number
}

export function labelSheetLayout(columns: number): LabelSheetLayout {
  // `?? DEFAULT` rather than a non-null assertion: the lookup is a plain index
  // into a record, and TypeScript is right that it can miss.
  const labelHeightMm =
    LABEL_HEIGHT_MM[columns] ?? LABEL_HEIGHT_MM[DEFAULT_COLUMNS]
  const resolved =
    LABEL_HEIGHT_MM[columns] === undefined ? DEFAULT_COLUMNS : columns
  const cellHeightMm = labelHeightMm + CELL_PADDING_MM * 2

  // Floor, not round: a row that half fits does not fit.
  const rowsPerPage = Math.max(
    1,
    Math.floor((PRINTABLE_HEIGHT_MM - SAFETY_MM) / cellHeightMm),
  )

  return {
    columns: resolved,
    labelHeightMm,
    cellHeightMm,
    rowsPerPage,
    labelsPerPage: rowsPerPage * resolved,
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
