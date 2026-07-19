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
