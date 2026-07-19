export interface StudentScoreProfile {
  name?: string | null
}

export interface StudentScoreUser {
  profile?: StudentScoreProfile | null
}

export interface StudentScoreStudent {
  id: string
  nis: string
  user?: StudentScoreUser
}

export interface StudentScoreEnrollment {
  id: string
  studentId: string
  student?: StudentScoreStudent
}

export interface StudentScoreAssessmentItem {
  id: string
  name: string
  type: string
  weight: number
  maxScore: number
}

export interface StudentScore {
  id?: string
  enrollmentId: string
  assessmentItemId: string
  score: number | null
  notes?: string | null
  enrollment?: StudentScoreEnrollment
  assessmentItem?: StudentScoreAssessmentItem
}

export interface StudentScoreQueryParams {
  enrollmentId?: string
  assessmentItemId?: string
  limit?: number
}

export interface StudentScoreSavePayload {
  enrollmentId: string
  assessmentItemId: string
  score: number
  note?: string
}

export interface BulkStudentScorePayload {
  scores: StudentScoreSavePayload[]
}

export interface StudentScoreRow {
  student?: {
    id?: string
    nis?: string
    user?: { profile?: { name?: string } }
  }
  enrollmentId?: string
  scores?: Record<
    string,
    { id?: string; score: number | null; notes?: string | null }
  >
}

export interface StudentScoreColumnActions {
  onEdit?: (item: StudentScoreRow) => void
}
