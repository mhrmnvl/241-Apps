export interface ClassroomLevel {
  id: string
  level: number
  name: string
  isActive: boolean
}

export interface ClassroomLevelColumnActions {
  onEdit?: (item: ClassroomLevel) => void
  onDelete?: (
    item: ClassroomLevel,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
