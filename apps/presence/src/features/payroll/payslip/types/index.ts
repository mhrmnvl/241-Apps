import type { AttendanceDriver, SalaryComponentType } from '../../component'
import type { PayrollRunKind, PayrollRunStatus } from '../../run'

export interface PayslipLine {
  componentCode: string
  componentName: string
  componentType: SalaryComponentType
  /** Whole rupiah as a string. */
  amount: string
  driver: AttendanceDriver | null
  driverCount: number | null
  rate: string | null
}

export interface PayslipAttendance {
  presentDays: number
  absentDays: number
  lateCount: number
  lateMinutes: number
  earlyLeaveCount: number
  leaveDays: number
  officialDutyDays: number
}

export interface Payslip {
  id: string
  run: {
    id: string
    year: number
    month: number
    kind: PayrollRunKind
    status: PayrollRunStatus
  }
  employee: { userId: string; displayName: string | null; identifier: string }
  attendance: PayslipAttendance
  lines: PayslipLine[]
  gross: string
  deductions: string
  net: string
}

export const ATTENDANCE_LABEL: Record<keyof PayslipAttendance, string> = {
  presentDays: 'Hari hadir',
  absentDays: 'Hari alpa',
  lateCount: 'Keterlambatan',
  lateMinutes: 'Menit terlambat',
  earlyLeaveCount: 'Pulang cepat',
  leaveDays: 'Hari izin',
  officialDutyDays: 'Hari dinas luar',
}
