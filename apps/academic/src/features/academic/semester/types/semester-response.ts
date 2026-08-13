export interface RolloverCategoryResult {
  created: number
  skipped: number
}

export interface RolloverSummary {
  classes: RolloverCategoryResult
  enrollments: RolloverCategoryResult
  supervisors: RolloverCategoryResult
  teachingAssignments: RolloverCategoryResult
  schedules: RolloverCategoryResult
}

/** Graduation left this flow — it is its own action now, under Kelulusan. */
export type PromotionAction = 'PROMOTE' | 'REPEAT'

export interface PromotionRecommendationItem {
  studentId: string
  studentName: string
  nis: string
  sourceClassroomId: string
  sourceClassName: string
  sourceLevel: string
  recommendedAction: PromotionAction
  targetClassroomId?: string
  targetClassName?: string
  targetLevel?: string
  averageScore?: number | null
}

export interface PromotionRecommendationResponse {
  items: PromotionRecommendationItem[]
  totalStudents: number
  /** Final-year students, who are graduated under Kelulusan rather than here. */
  excludedGraduatingCount: number
}

export interface PromotionStudentDecision {
  studentId: string
  sourceClassroomId: string
  targetClassroomId?: string
  action: PromotionAction
  approved: boolean
  declineReason?: string
}

export interface PromotionPreviewResponse {
  items: { action: PromotionAction; studentCount: number }[]
  totalStudents: number
  promotedCount: number
  repeatedCount: number
}

export interface PromotionResult {
  promoted: number
  repeated: number
  skipped: number
}

export interface RolloverSummaryRow {
  label: string
  created: number
  skipped: number
}
