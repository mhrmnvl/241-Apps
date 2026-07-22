export interface StudentScoreRosterItem {
  enrollmentId: string
  nis: string
  studentName: string
  scoreId: string | null
  score: number | null
  note: string | null
}

export interface StudentScoreRosterAssessmentItem {
  id: string
  name: string
  type: string
  weight: number
  maxScore: number
}

export interface StudentScoreRosterResponse {
  assessmentItem: StudentScoreRosterAssessmentItem
  items: StudentScoreRosterItem[]
}

export interface BulkStudentScoreRecordPayload {
  enrollmentId: string
  score?: number
  note?: string
}

export interface BulkUpsertStudentScorePayload {
  assessmentItemId: string
  records: BulkStudentScoreRecordPayload[]
}
