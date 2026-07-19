import type { Occupation } from './occupation'

export interface OccupationColumnActions {
  onEdit: (item: Occupation) => void
  onDelete: (
    id: string,
    setLoading: (v: boolean) => void,
    closeAlert: () => void,
  ) => void
}
