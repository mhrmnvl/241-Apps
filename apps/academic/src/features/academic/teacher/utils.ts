import type { Teacher } from './types'

export function getPrimaryPosition(teacher: Teacher): string {
  const primary = teacher.teacherPositions?.find((ep) => ep.isPrimary)
  return primary?.position?.name ?? '-'
}

export function isGuru(teacher: Teacher): boolean {
  const primary = teacher.teacherPositions?.find((ep) => ep.isPrimary)
  return primary?.position?.category?.code === 'ACADEMIC'
}
