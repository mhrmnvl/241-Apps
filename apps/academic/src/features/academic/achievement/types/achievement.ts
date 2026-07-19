export const ACHIEVEMENT_TYPES = [
  { value: 'DISTRICT', label: 'Kecamatan' },
  { value: 'CITY', label: 'Kabupaten / Kota' },
  { value: 'PROVINCE', label: 'Provinsi' },
  { value: 'NATIONAL', label: 'Nasional' },
  { value: 'INTERNATIONAL', label: 'Internasional' },
] as const

export type AchievementType = (typeof ACHIEVEMENT_TYPES)[number]['value']

export function getAchievementTypeLabel(type: string): string {
  return ACHIEVEMENT_TYPES.find((t) => t.value === type)?.label ?? type
}

export interface Achievement {
  id: string
  profileId: string
  name: string
  level: string
  typeId: string
  type?: { id: string; name: string } | null
  year: number
  description?: string | null
  deletedAt?: string | null
}
