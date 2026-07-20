export interface ClassroomSavePayload {
  curriculumId: string
  academicYearId: string
  gradeId: string
  code: string
  name?: string | null
  capacity: number
  isActive: boolean
}

export interface ClassroomQueryParams {
  page?: number
  limit?: number
  curriculumId?: string
  academicYearId?: string
  gradeId?: string
  classroomLevelId?: string
  search?: string
  isActive?: boolean
}

export interface ClassroomSupervisorQueryParams {
  page?: number
  limit?: number
  classroomId?: string
  teacherId?: string
  semesterId?: string
}

export interface ClassroomSupervisorSavePayload {
  classroomId: string
  teacherId: string
  semesterId: string
}
