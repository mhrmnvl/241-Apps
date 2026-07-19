import type { AcademicYear } from './academic-year'

export interface AcademicYearCreateResponse {
  academicYear: AcademicYear
  semesters: { id: string; type: string; isActive: boolean }[]
  classesCreated: number
}
