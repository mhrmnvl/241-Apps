import type { EducationalHistory } from './educational-history'

export interface EducationalHistoryColumnActions {
  onEdit: (item: EducationalHistory) => void
  onDelete: (
    id: string,
    setLoading: (v: boolean) => void,
    closeAlert: () => void,
  ) => void
}
