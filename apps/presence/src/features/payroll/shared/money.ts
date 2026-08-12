/**
 * Money arrives from the API as a whole-rupiah **string** and stays one until
 * it is displayed.
 *
 * JSON numbers are IEEE-754 doubles, so parsing a salary into one to format it
 * is the exact conversion the API went out of its way to avoid. `Intl` takes a
 * string, so nothing here needs to.
 */
const RUPIAH = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatRupiah(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === '') return '—'

  return RUPIAH.format(Number(value))
}

/** Digits only, for a count beside a rate ("3 × Rp 150.000"). */
export function formatCount(value: number | null | undefined): string {
  return value === null || value === undefined
    ? '—'
    : new Intl.NumberFormat('id-ID').format(value)
}

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export function formatPeriod(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1] ?? month} ${year}`
}
