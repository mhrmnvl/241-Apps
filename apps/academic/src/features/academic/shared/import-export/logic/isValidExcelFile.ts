const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Accepts a file by its Excel MIME type, or by `.xlsx` extension as a fallback. */
export function isValidExcelFile(file: File): boolean {
  return file.type === XLSX_MIME || file.name.endsWith('.xlsx')
}
