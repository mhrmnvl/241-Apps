import type { AssessmentItem } from './assessment-item'

export interface AssessmentItemColumnActions {
  onEdit?: (item: AssessmentItem) => void
  onDelete?: (
    item: AssessmentItem,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  onGrade?: (item: AssessmentItem) => void
  canUpdate?: boolean
  canDelete?: boolean
}
