import type { Subject } from './subject'

export interface SubjectColumnActions {
  onEdit?: (subject: Subject) => void
  onDelete?: (
    subject: Subject,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
