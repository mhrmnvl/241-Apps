import type { AssessmentType } from './assessment-item'

export interface AssessmentItemSavePayload {
  teachingAssignmentId?: string
  name: string
  type: AssessmentType
  weight?: number
  maxScore?: number
}
