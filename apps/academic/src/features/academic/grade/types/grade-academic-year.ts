export interface GradeAcademicYear {
  id: string
  gradeId: string
  academicYearId: string
  curriculumId: string
  grade?: { id: string; name: string; level: number }
  academicYear?: { id: string; name: string }
  curricula?: { id: string; name: string }
}

export interface AssignCurriculumPayload {
  gradeId: string
  academicYearId: string
  curriculumId: string
}
