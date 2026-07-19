import type { Semester } from './semester'

export interface SemesterColumnActions {
  onEdit?: (semester: Semester) => void
  onDelete?: (
    semester: Semester,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  onActivate?: (semester: Semester) => void
  onDeactivate?: (semester: Semester) => void
  showActions?: boolean
}
