import type { Subject } from './subject'

export interface SubjectColumnActions {
  onEdit?: (subject: Subject) => void
  onDelete?: (
    subject: Subject,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
