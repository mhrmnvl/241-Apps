import type { AcademicYear } from './academic-year'

export interface AcademicYearColumnActions {
  onEdit?: (academicYear: AcademicYear) => void
  onDelete?: (
    academicYear: AcademicYear,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  onActivate?: (academicYear: AcademicYear) => void
  onDeactivate?: (academicYear: AcademicYear) => void
  showActions?: boolean
}
