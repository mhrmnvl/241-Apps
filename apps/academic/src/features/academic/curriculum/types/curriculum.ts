export interface AcademicYearRef {
  id: string
  name: string
  isActive: boolean
}

export interface Curriculum {
  id: string
  name: string
  academicYearId: string
  isActive: boolean
  academicYear?: AcademicYearRef
}

export interface CurriculumColumnActions {
  onEdit?: (curriculum: Curriculum) => void
  onView?: (curriculum: Curriculum) => void
  onDelete?: (
    curriculum: Curriculum,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
