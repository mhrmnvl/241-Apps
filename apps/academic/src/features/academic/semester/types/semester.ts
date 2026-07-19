export interface SemesterTypeRef {
  id: string
  name: 'ODD' | 'EVEN'
}

export interface AcademicYearRef {
  id: string
  name: string
  isActive?: boolean
}

export interface Semester {
  id: string
  academicYearId: string
  typeId: string
  type: SemesterTypeRef
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  academicYear?: AcademicYearRef
}
