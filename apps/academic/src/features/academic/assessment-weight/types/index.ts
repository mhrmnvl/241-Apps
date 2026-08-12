import type { AssessmentType } from '@/features/academic/assessment-item'

export interface AssessmentWeight {
  type: AssessmentType
  /** Percentage of the subject score this type carries. */
  weight: number
}

export interface ReplaceAssessmentWeightsPayload {
  teachingAssignmentId: string
  weights: AssessmentWeight[]
}

/** Indonesian labels for the five types, in the order teachers expect them. */
export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  DAILY: 'Harian',
  ASSIGNMENT: 'Tugas',
  PRACTICAL: 'Praktik',
  MIDTERM: 'UTS',
  FINAL: 'UAS',
}

export const ASSESSMENT_TYPE_ORDER: AssessmentType[] = [
  'DAILY',
  'ASSIGNMENT',
  'PRACTICAL',
  'MIDTERM',
  'FINAL',
]

/** The weights must add up to this before they can be saved. */
export const ASSESSMENT_WEIGHT_TOTAL = 100
