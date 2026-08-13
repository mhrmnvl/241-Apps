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
  /**
   * Present on the school-wide list, absent on the profile tab — there the
   * person is the page, so the API is not asked to repeat them.
   */
  profile?: { id: string; name: string; userId: string } | null
}

/** Filters the standalone list offers; all optional, as the backend has them. */
export interface AchievementQueryParams {
  page?: number
  limit?: number
  typeId?: string
  year?: number
  profileId?: string
}
