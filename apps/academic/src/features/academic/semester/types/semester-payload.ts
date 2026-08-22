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
  /**
   * Required for both actions. A student held back still enrols somewhere —
   * the same grade they were in — so there is no decision without a classroom.
   */
  targetClassroomId: string
  action: 'PROMOTE' | 'REPEAT'
  declineReason?: string
}

/**
 * Promotion is addressed by academic year, not by semester.
 *
 * Moving a student up a grade happens between years; moving them between the
 * terms of one year is a rollover, which keeps its own semester-shaped payload
 * above. Which term of each year is read and written is settled on the server,
 * so the screen cannot pair two terms of the same year — a state it used to be
 * able to reach in two clicks, and which the server then had to refuse.
 */
export interface PromotionPayload {
  sourceAcademicYearId: string
  targetAcademicYearId: string
  students: PromotionStudentPayload[]
}

export interface GenerateRecommendationPayload {
  sourceAcademicYearId: string
  targetAcademicYearId: string
}
