export interface AcademicYear {
  id: string
  name: string
  /** The calendar year this school year opens in: 2026 for "2026/2027". */
  startYear: number
  isActive: boolean
  deletedAt?: string | null
}
