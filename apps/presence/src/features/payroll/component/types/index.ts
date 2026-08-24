export type SalaryComponentType =
  'BASE' | 'ALLOWANCE' | 'ATTENDANCE_DRIVEN' | 'DEDUCTION'

export type AttendanceDriver =
  | 'PRESENT_DAYS'
  | 'ABSENT_DAYS'
  | 'LATE_COUNT'
  | 'LATE_MINUTES'
  | 'EARLY_LEAVE_COUNT'
  | 'LEAVE_DAYS'
  | 'OFFICIAL_DUTY_DAYS'

export interface SalaryComponent {
  id: string
  code: string
  name: string
  type: SalaryComponentType
  driver: AttendanceDriver | null
  isActive: boolean
}

export interface CreateSalaryComponentPayload {
  code: string
  name: string
  type: SalaryComponentType
  driver?: AttendanceDriver | null
}

export interface UpdateSalaryComponentPayload {
  code?: string
  name?: string
  type?: SalaryComponentType
  driver?: AttendanceDriver | null
  isActive?: boolean
}

export type SalaryComponentSavePayload = CreateSalaryComponentPayload & {
  isActive?: boolean
}

export const COMPONENT_TYPE_LABEL: Record<SalaryComponentType, string> = {
  BASE: 'Gaji Pokok',
  ALLOWANCE: 'Tunjangan',
  ATTENDANCE_DRIVEN: 'Berbasis Kehadiran',
  DEDUCTION: 'Potongan',
}

export const DRIVER_LABEL: Record<AttendanceDriver, string> = {
  PRESENT_DAYS: 'Jumlah hari hadir',
  ABSENT_DAYS: 'Jumlah hari alpa',
  LATE_COUNT: 'Jumlah keterlambatan',
  LATE_MINUTES: 'Total menit terlambat',
  EARLY_LEAVE_COUNT: 'Jumlah pulang cepat',
  LEAVE_DAYS: 'Jumlah hari izin',
  OFFICIAL_DUTY_DAYS: 'Jumlah hari dinas luar',
}

/** The type decides the sign; the driver decides fixed or counted. */
export const DEDUCTION_TYPES: SalaryComponentType[] = ['DEDUCTION']
export const DRIVABLE_TYPES: SalaryComponentType[] = [
  'ATTENDANCE_DRIVEN',
  'DEDUCTION',
]
