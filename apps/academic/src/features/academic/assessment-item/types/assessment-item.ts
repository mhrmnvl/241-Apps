export type AssessmentType =
  | 'DAILY'
  | 'MIDTERM'
  | 'FINAL'
  | 'ASSIGNMENT'
  | 'PRACTICAL'

export interface AssessmentItem {
  id: string
  teachingAssignmentId: string
  name: string
  type: AssessmentType
  weight: number
  maxScore: number
  createdAt: string
  updatedAt: string
}
