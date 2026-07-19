import type { TimeSlot } from './time-slot'

export interface TimeSlotColumnActions {
  onEdit?: (timeSlot: TimeSlot) => void
  onDelete?: (
    timeSlot: TimeSlot,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
