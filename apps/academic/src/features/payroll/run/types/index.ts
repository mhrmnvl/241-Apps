export type PayrollRunStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED'
export type PayrollRunKind = 'ORIGINAL' | 'ADJUSTMENT'

export interface PayrollActor {
  id: string
  displayName: string | null
}

export interface PayrollRunTotals {
  employeeCount: number
  /** Whole rupiah as strings — formatted for display, never parsed for maths. */
  gross: string
  deductions: string
  net: string
}

export interface PayslipNetChange {
  userId: string
  displayName: string | null
  previousNet: string
  currentNet: string
}

export interface PreviousDraftComparison {
  net: string
  changedPayslips: PayslipNetChange[]
}

export interface PayrollRun {
  id: string
  year: number
  month: number
  kind: PayrollRunKind
  sequence: number
  status: PayrollRunStatus
  roundingRule: string
  note: string | null
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
  totals: PayrollRunTotals
  createdBy: PayrollActor
  submittedBy: PayrollActor | null
  approvedBy: PayrollActor | null
  previousDraft?: PreviousDraftComparison
}

export interface CreatePayrollRunPayload {
  year: number
  month: number
  kind?: PayrollRunKind
  note?: string
}

export interface PayslipSummary {
  id: string
  employee: { userId: string; displayName: string | null; identifier: string }
  gross: string
  deductions: string
  net: string
}

export const RUN_STATUS_LABEL: Record<PayrollRunStatus, string> = {
  DRAFT: 'Draf',
  SUBMITTED: 'Diajukan',
  APPROVED: 'Disetujui',
}

export const RUN_KIND_LABEL: Record<PayrollRunKind, string> = {
  ORIGINAL: 'Utama',
  ADJUSTMENT: 'Penyesuaian',
}
