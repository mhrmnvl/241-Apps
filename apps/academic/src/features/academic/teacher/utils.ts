import type { Teacher } from './types'

export function getPrimaryPosition(teacher: Teacher): string {
  const primary = teacher.teacherPositions?.find((ep) => ep.isPrimary)
  return primary?.position?.name ?? '-'
}

export function isGuru(teacher: Teacher): boolean {
  const primary = teacher.teacherPositions?.find((ep) => ep.isPrimary)
  return primary?.position?.category?.code === 'ACADEMIC'
}

const POSITION_CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: 'Akademik',
  MANAGEMENT: 'Pimpinan',
  FINANCE: 'Keuangan',
  ADMIN: 'Tata Usaha',
}

export function positionCategoryLabel(
  code?: string,
  fallback?: string,
): string {
  if (!code) return fallback ?? '-'
  return POSITION_CATEGORY_LABELS[code] ?? fallback ?? code
}
