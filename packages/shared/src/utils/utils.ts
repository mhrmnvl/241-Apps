/**
 * Modul: Utils Shared
 * Deskripsi: Kumpulan fungsi utilitas yang dapat digunakan di seluruh aplikasi
 *
 * Digunakan pada:
 * - Komponen UI shadcn dan halaman lainnya
 */
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fungsi: Menggabungkan beberapa nama kelas Tailwind dengan aman
 * Parameter:
 * - inputs (ClassValue[]): Kumpulan array kelas yang akan digabung
 *
 * Mengembalikan:
 * - String nama kelas akhir
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fungsi: Memformat tampilan nama entitas jika dihapus (soft delete)
 * Parameter:
 * - name (string): Nama entitas asli
 * - deletedAt (Opsional): Data waktu penghapusan
 *
 * Mengembalikan:
 * - Nama entitas bersih dengan imbuhan (Terhapus) jika berlaku
 */
export function formatEntityName(
  name: string | undefined | null,
  deletedAt?: string | Date | null,
): string {
  if (!name) return ''
  let cleanName: string = name
  const parts = name.split('_deleted_')
  if (parts.length > 1 && parts[0]) {
    cleanName = parts[0]
    return `${cleanName} (Terhapus)`
  }

  if (deletedAt) {
    return `${cleanName} (Terhapus)`
  }

  return cleanName
}

/**
 * A `Date` as an `<input type="date">` value, in the reader's own timezone.
 *
 * `toISOString().split('T')[0]` is the obvious way and it is wrong east of
 * Greenwich: it converts to UTC first, so in WIB every moment before 07.00
 * belongs to the previous day. An attendance register opened at half past six
 * offered yesterday, and the teacher had to notice.
 *
 * The offset is subtracted before formatting so the calendar day is the local
 * one. Returns the same `YYYY-MM-DD` shape the input and the API expect.
 */
export function toDateInputValue(date: Date = new Date()): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}
