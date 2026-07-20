export interface Grade {
  id: string
  level: number
  name: string
  isActive: boolean
}

export interface GradeColumnActions {
  onEdit?: (item: Grade) => void
  onDelete?: (
    item: Grade,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
