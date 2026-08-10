export type ScanOutcome =
  | 'ACCEPTED'
  | 'DUPLICATE'
  | 'REJECTED_UNKNOWN'
  | 'REJECTED_REVOKED'
  | 'REJECTED_INACTIVE'
  | 'REJECTED_STALE'

export type ScanDirection = 'CHECK_IN' | 'CHECK_OUT' | 'NONE'

export interface ScanPerson {
  displayName: string | null
  subjectType: string
  photoUrl: string | null
}

export interface ScanResult {
  outcome: ScanOutcome
  direction: ScanDirection
  dayStatus: string
  lateMinutes: number
  recordedAt: string
  /** Absent on every rejection — an unknown card must reveal nobody. */
  person?: ScanPerson
  rejectionReason?: string
}

export interface ClockAnchor {
  serverTime: string
  anchorId: string
  maxOfflineWindowHours: number
}

/** One scan waiting in the offline queue. */
export interface QueuedScan {
  clientEventId: string
  code: string
  occurredAt: string | null
  clockAnchorId: string | null
}

export interface BatchScanResult {
  clientEventId: string
  outcome: ScanOutcome
  accepted: boolean
}

export const ACCEPTED_OUTCOMES: ScanOutcome[] = ['ACCEPTED', 'DUPLICATE']
