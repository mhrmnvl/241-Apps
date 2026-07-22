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
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
