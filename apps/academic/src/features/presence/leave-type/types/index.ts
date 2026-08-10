export type LeaveTreatment = 'ON_LEAVE' | 'OFFICIAL_DUTY'
export type LeaveAppliesTo = 'STUDENT' | 'EMPLOYEE'

export interface LeaveType {
  id: string
  code: string
  name: string
  treatment: LeaveTreatment
  consumesQuota: boolean
  annualQuota: number | null
  requiresDocument: boolean
  appliesTo: LeaveAppliesTo
  isActive: boolean
}

export interface LeaveTypeSavePayload {
  code: string
  name: string
  treatment: LeaveTreatment
  consumesQuota: boolean
  annualQuota?: number | null
  requiresDocument: boolean
  appliesTo: LeaveAppliesTo
  isActive?: boolean
}

export const TREATMENT_LABEL: Record<LeaveTreatment, string> = {
  ON_LEAVE: 'Izin/Cuti',
  OFFICIAL_DUTY: 'Dinas Luar',
}

export const APPLIES_TO_LABEL: Record<LeaveAppliesTo, string> = {
  EMPLOYEE: 'Pegawai',
  STUDENT: 'Siswa',
}
