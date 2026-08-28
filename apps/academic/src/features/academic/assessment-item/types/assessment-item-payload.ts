import type { AssessmentType } from './assessment-item'

/** The fields an edit may change. */
export interface AssessmentItemUpdatePayload {
  name: string
  type: AssessmentType
  weight?: number
  maxScore?: number
}

/**
 * Creating additionally says which teaching assignment the task belongs to.
 *
 * Two shapes rather than one optional field, because the server refuses
 * `teachingAssignmentId` on an update — moving a task to another teacher's
 * class is not an edit — and one payload type with it marked optional let the
 * form send it either way. It always did, and every edit came back with
 * "teachingAssignmentId should not exist".
 */
export interface AssessmentItemCreatePayload extends AssessmentItemUpdatePayload {
  teachingAssignmentId: string
}

export type AssessmentItemSavePayload =
  AssessmentItemCreatePayload | AssessmentItemUpdatePayload
