import type { Achievement } from './achievement'

export interface AchievementEditData {
  id?: string
  profileId?: string
  name?: string
  level?: string
  typeId?: string
  year?: number
  description?: string | null
}

export interface AchievementTabData {
  achievements?: Achievement[]
}

export interface AchievementColumnActions {
  onEdit: (item: Achievement) => void
  onDelete: (
    id: string,
    setLoading: (v: boolean) => void,
    closeAlert: () => void,
  ) => void
}

export interface UseAchievementFormOptions {
  props: {
    open: boolean
    editingItem?: AchievementEditData | null
    profileId: string
  }
  emit: {
    (e: 'update:open', value: boolean): void
    (e: 'reload'): void
  }
}
