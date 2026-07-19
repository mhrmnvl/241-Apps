export interface SemesterSavePayload {
  academicYearId: string
  typeId: string
  startDate?: string
  endDate?: string
}

export interface SemesterFormState {
  academicYearId: string
  typeId: string
  startDate: string
  endDate: string
}

export interface RolloverSemesterPayload {
  sourceSemesterId: string
  targetSemesterId: string
}

export interface PromotionStudentPayload {
  studentId: string
  sourceClassroomId: string
  targetClassroomId?: string
  action: 'PROMOTE' | 'REPEAT' | 'GRADUATE'
  declineReason?: string
}

export interface PromotionPayload {
  sourceSemesterId: string
  targetSemesterId: string
  students: PromotionStudentPayload[]
}

export interface GenerateRecommendationPayload {
  sourceSemesterId: string
  targetSemesterId: string
}
