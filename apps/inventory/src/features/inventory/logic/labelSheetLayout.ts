/**
 * One label, and how many of it fit on a page.
 *
 * Three things this module is built around.
 *
 * **There is one label.** It is a physical object stuck on a cupboard and read
 * from arm's length, so it has one size and that size does not move. Offering
 * four was offering a decision nobody wanted to make, and it let two assets on
 * the same shelf end up wearing different stickers.
 *
 * **Paper decides only how many fit.** Print on A4 or on A3 and what comes off
 * the guillotine is the same sticker; A3 simply holds more of them.
 *
 * **Nothing is left to the browser to decide.** Automatic fragmentation kept
 * putting a label — or the cut guide beside it — across a page boundary: a grid
 * broken at whatever point the content happened to reach, with
 * `break-inside: avoid` treated as a hint. The rows and columns that fit are
 * arithmetic, and the units are cut into explicit pages before anything is
 * rendered.
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

/**
 * The label, in millimetres of actual sticker.
 *
 * 58 × 24 was the middle of the four sizes that used to be on offer and the one
 * both screens defaulted to, so nothing printed before this comes out a
 * different size.
 */
export const LABEL_WIDTH_MM = 58
export const LABEL_HEIGHT_MM = 24

/** Taken off every edge, and the same number `@page` is given. */
export const PAGE_MARGIN_MM = 8

/** The padding around the label, between it and its cut guide. */
export const CELL_PADDING_MM = 3

/**
 * Never bet the last millimetre.
 *
 * Printers round, and a page that fits in theory and overflows by a hair in
 * practice costs a whole extra sheet — and puts one orphaned label on it.
 */
export const SAFETY_MM = 2

/**
 * The label is in three parts: a logo square on the left, and to the right of
 * it the unit number above the asset name.
 *
 * The logo takes a fifth. The rest is what somebody actually reads.
 */
const LOGO_SHARE = 0.15

/** The inner padding of the text cells, twice over. */
const TEXT_INSET_MM = 3

/**
 * How many characters a unit number can be.
 *
 * Not a guess — the format is built in `create-asset.use-case.ts`:
 *
 *     AST-{category}/{year}/{seq3}-{nn}        AST-ELEK/2026/001-05
 *      4  +  code  + 6     + 3   + 3  =  16 + the category code
 *
 * The codes in use are four characters, which makes twenty. Twenty-four leaves
 * room for an eight-character one without anybody having to come back here.
 *
 * It was sixteen, and every real unit number was four characters too long for
 * the type it was sized against — which is why they were coming out truncated.
 */
const NUMBER_CHAR_BUDGET = 24

/**
 * Roughly the advance width of one character, as a fraction of the font size.
 *
 * 0.55 is ordinary text; the number is set bold and is mostly digits and
 * capitals, which are wider.
 */
const CHAR_WIDTH_RATIO = 0.62
const NAME_FONT_RATIO = 0.78
const LINE_HEIGHT = 1.15
/** The name is allowed two lines; the number is always one. */
const NAME_LINES = 2

/** The logo square, and the width of the two text rows beside it. */
export const LOGO_MM = Math.min(LABEL_HEIGHT_MM, LABEL_WIDTH_MM * LOGO_SHARE)
export const TEXT_WIDTH_MM = LABEL_WIDTH_MM - LOGO_MM - TEXT_INSET_MM

/**
 * The number and the name each get half the label's height, divided by a rule.
 * The name may take two lines of its half; the number always takes one of its.
 */
const ROW_HEIGHT_MM = LABEL_HEIGHT_MM / 2 - 1

const NUMBER_BY_WIDTH = TEXT_WIDTH_MM / (NUMBER_CHAR_BUDGET * CHAR_WIDTH_RATIO)
const NUMBER_BY_HEIGHT = ROW_HEIGHT_MM / LINE_HEIGHT
const NAME_BY_HEIGHT = ROW_HEIGHT_MM / (LINE_HEIGHT * NAME_LINES)

export const NUMBER_FONT_MM = Math.min(NUMBER_BY_WIDTH, NUMBER_BY_HEIGHT)
export const NAME_FONT_MM = Math.min(
  NUMBER_FONT_MM * NAME_FONT_RATIO,
  NAME_BY_HEIGHT,
)

export interface LabelSheetLayout {
  paper: PaperSize
  /** The label plus the padding around it — the box that tiles. */
  cellWidthMm: number
  cellHeightMm: number
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

export function labelSheetLayout(
  paperId: string | undefined,
): LabelSheetLayout {
  const paper = paperById(paperId)

  const cellWidthMm = LABEL_WIDTH_MM + CELL_PADDING_MM * 2
  const cellHeightMm = LABEL_HEIGHT_MM + CELL_PADDING_MM * 2

  const printableWidth = paper.widthMm - PAGE_MARGIN_MM * 2
  const printableHeight = paper.heightMm - PAGE_MARGIN_MM * 2

  // Floor, both ways: a row or a column that half fits does not fit.
  const columns = Math.max(1, Math.floor(printableWidth / cellWidthMm))
  const rowsPerPage = Math.max(
    1,
    Math.floor((printableHeight - SAFETY_MM) / cellHeightMm),
  )

  return {
    paper,
    cellWidthMm,
    cellHeightMm,
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
