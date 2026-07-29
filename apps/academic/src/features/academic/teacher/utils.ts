import type { Teacher, TeacherSavePayload, TeacherUpdatePayload } from './types'

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

export function getPrimaryCategoryLabel(teacher: Teacher): string {
  const primary = teacher.teacherPositions?.find((ep) => ep.isPrimary)
  const cat = primary?.position?.category
  return positionCategoryLabel(cat?.code, cat?.name)
}

export function buildTeacherCreatePayload(
  values: Record<string, unknown>,
): TeacherSavePayload {
  return {
    name: values.name as string,
    nik: values.nik as string,
    gender: values.gender as 'MALE' | 'FEMALE',
    birthPlace: values.birthPlace as string,
    birthDate: values.birthDate as string,
    employmentTypeId: values.employmentTypeId as string,
    positionId: (values.positionId as string) || undefined,
    identifier: (values.nip as string) || (values.nik as string),
    password: (values.nip as string) || (values.nik as string),
    email: (values.email as string) || undefined,
    phone: (values.phone as string) || undefined,
    nip: (values.nip as string) || undefined,
    nuptk: (values.nuptk as string) || undefined,
  }
}

export function buildTeacherUpdatePayload(
  values: Record<string, unknown>,
): TeacherUpdatePayload {
  return {
    nip: (values.nip as string) || undefined,
    nuptk: (values.nuptk as string) || undefined,
    employmentTypeId: values.employmentTypeId as string,
  }
}

export interface PositionChangeResult {
  teacherId: string
  positionId: string
  oldPositionLinkId: string | null
}

/** Detects whether a teacher's primary position changed, for the separate save-position emit. */
export function resolvePositionChange(
  teacherId: string | undefined,
  newPositionId: string,
  originalPositionId: string,
  originalPositionLinkId: string | null,
): PositionChangeResult | null {
  if (!teacherId || !newPositionId || newPositionId === originalPositionId) {
    return null
  }
  return {
    teacherId,
    positionId: newPositionId,
    oldPositionLinkId: originalPositionLinkId,
  }
}
