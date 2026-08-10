import type { AttendanceDriver, SalaryComponentType } from '../../component'

export interface SalaryAssignment {
  id: string
  userId: string
  componentId: string
  /** Whole rupiah as a string — never parsed into a number except to display. */
  amount: string | null
  rate: string | null
  effectiveFrom: string
  /** Set when a later assignment superseded this one. */
  effectiveTo: string | null
  component: {
    id: string
    code: string
    name: string
    type: SalaryComponentType
    driver: AttendanceDriver | null
  }
  holder: { id: string; displayName: string | null }
}

export interface SalaryAssignmentSavePayload {
  userId: string
  componentId: string
  amount?: string | null
  rate?: string | null
  effectiveFrom: string
}

/** An employee the picker can point at — from the teacher roster. */
export interface EmployeeOption {
  userId: string
  name: string
  identifier: string
}
