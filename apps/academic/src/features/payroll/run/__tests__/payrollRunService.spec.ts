import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatCount, formatRupiah } from '../../shared/money'
import { payrollRunApi } from '../api/payrollRunApi'
import {
  currentRun,
  payrollRunService,
  unconfiguredEmployees,
} from '../services/payrollRunService'

vi.mock('../api/payrollRunApi', () => ({
  payrollRunApi: {
    getRuns: vi.fn(),
    getRun: vi.fn(),
    getRunPayslips: vi.fn(),
    createRun: vi.fn(),
    recalculateRun: vi.fn(),
    submitRun: vi.fn(),
    approveRun: vi.fn(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const { toast } = await import('vue-sonner')

/** The first argument of the first toast call, as text. */
function firstMessage(spy: { mock: { calls: unknown[][] } }): string {
  const [message] = spy.mock.calls[0] ?? []
  return typeof message === 'string' ? message : ''
}

describe('rupiah formatting', () => {
  /**
   * Money crosses the wire as a string precisely so it never becomes an
   * IEEE-754 double. `Intl` accepts one, so nothing here has to parse it.
   */
  // `Intl` separates the symbol with a non-breaking space, so these match on
  // `\s` rather than a literal one — an equality test here fails for a reason
  // that has nothing to do with the amount.
  it('formats a whole-rupiah string without inventing decimals', () => {
    expect(formatRupiah('3500000')).toMatch(/^Rp\s3\.500\.000$/)
  })

  it('shows an absent amount as a dash rather than Rp 0', () => {
    expect(formatRupiah(null)).toBe('—')
    expect(formatRupiah('')).toBe('—')
  })

  it('formats a driver count in Indonesian grouping', () => {
    expect(formatCount(1500)).toBe('1.500')
  })

  /**
   * The backend's reconciliation guarantee, restated where the operator sees
   * it: the totals shown must be the sum of the lines shown, or the payslip
   * cannot be defended to the person holding it (SC-015).
   */
  it('reconciles displayed totals against displayed lines', () => {
    const lines = [
      { componentType: 'BASE', amount: '3500000' },
      { componentType: 'ALLOWANCE', amount: '150000' },
      { componentType: 'DEDUCTION', amount: '300000' },
    ]

    const gross = lines
      .filter((line) => line.componentType !== 'DEDUCTION')
      .reduce((total, line) => total + Number(line.amount), 0)
    const deductions = lines
      .filter((line) => line.componentType === 'DEDUCTION')
      .reduce((total, line) => total + Number(line.amount), 0)

    expect(formatRupiah(gross)).toMatch(/^Rp\s3\.650\.000$/)
    expect(formatRupiah(gross - deductions)).toMatch(/^Rp\s3\.350\.000$/)
  })
})

describe('payrollRunService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentRun.value = null
  })

  it('names the employees a refused run is missing salaries for', async () => {
    vi.mocked(payrollRunApi.createRun).mockRejectedValue({
      response: { data: { employees: ['Ahmad Fauzi', 'Siti Aminah'] } },
    })

    const result = await payrollRunService.create({ year: 2026, month: 7 })

    expect(result).toBeNull()
    expect(firstMessage(vi.mocked(toast.error))).toContain('Ahmad Fauzi')
  })

  it('falls back to a generic message when the refusal names nobody', () => {
    expect(unconfiguredEmployees({ response: { data: {} } })).toEqual([])
    expect(unconfiguredEmployees(new Error('offline'))).toEqual([])
  })

  it('says plainly when a recalculation changed nothing', async () => {
    vi.mocked(payrollRunApi.recalculateRun).mockResolvedValue({
      data: { data: { id: 'run-1', previousDraft: { changedPayslips: [] } } },
    } as never)
    vi.mocked(payrollRunApi.getRunPayslips).mockResolvedValue({
      data: { data: [] },
    } as never)

    await payrollRunService.recalculate('run-1')

    expect(firstMessage(vi.mocked(toast.success))).toContain(
      'Tidak ada nilai yang berubah',
    )
  })

  it('reports how many payslips a recalculation moved', async () => {
    vi.mocked(payrollRunApi.recalculateRun).mockResolvedValue({
      data: {
        data: {
          id: 'run-1',
          previousDraft: { changedPayslips: [{ userId: 'u1' }] },
        },
      },
    } as never)
    vi.mocked(payrollRunApi.getRunPayslips).mockResolvedValue({
      data: { data: [] },
    } as never)

    await payrollRunService.recalculate('run-1')

    expect(firstMessage(vi.mocked(toast.success))).toContain('1 slip gaji')
  })
})
