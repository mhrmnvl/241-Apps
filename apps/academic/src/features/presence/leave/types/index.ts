export type LeaveTreatment = 'ON_LEAVE' | 'OFFICIAL_DUTY'
export type LeaveRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'

export interface LeaveType {
  id: string
  code: string
  name: string
  treatment: LeaveTreatment
  consumesQuota: boolean
  annualQuota: number | null
  requiresDocument: boolean
  appliesTo: 'STUDENT' | 'EMPLOYEE'
  isActive: boolean
}

export interface LeavePerson {
  id: string
  displayName: string | null
}

export interface LeaveRequest {
  id: string
  requesterId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  reason: string
  documentFileId: string | null
  status: LeaveRequestStatus
  decidedAt: string | null
  decisionReason: string | null
  /** Only working days — a request spanning a weekend counts fewer. */
  workingDayCount: number
  createdAt: string
  requester: LeavePerson
  approver: LeavePerson | null
  leaveType: {
    id: string
    code: string
    name: string
    treatment: LeaveTreatment
  }
  days: string[]
}

export interface LeaveBalance {
  leaveTypeId: string
  code: string
  name: string
  year: number
  quota: number
  used: number
  remaining: number
}

export interface SubmitLeavePayload {
  leaveTypeId: string
  startDate: string
  endDate: string
  reason: string
  documentFileId?: string
}

export const STATUS_LABEL: Record<LeaveRequestStatus, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  WITHDRAWN: 'Ditarik',
}

export const STATUS_VARIANT: Record<LeaveRequestStatus, string> = {
  PENDING: 'outline',
  APPROVED: 'default',
  REJECTED: 'destructive',
  WITHDRAWN: 'secondary',
}
