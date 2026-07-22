export interface AcademicYearRef {
  id: string
  name: string
  isActive: boolean
}

export interface Curricula {
  id: string
  name: string
  academicYearId: string
  isActive: boolean
  academicYear?: AcademicYearRef
}

export interface CurriculaColumnActions {
  onEdit?: (curriculum: Curricula) => void
  onView?: (curriculum: Curricula) => void
  onDelete?: (
    curriculum: Curricula,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
