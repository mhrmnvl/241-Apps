import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { employeeAttendanceApi } from '../api/employeeAttendanceApi'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import type { DailyPresence } from '../types'

vi.mock('../api/employeeAttendanceApi', () => ({
  employeeAttendanceApi: {
    getDay: vi.fn(),
    getDetail: vi.fn(),
    getMine: vi.fn(),
    getRecap: vi.fn(),
    exportRecap: vi.fn(),
    create: vi.fn(),
    correct: vi.fn(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

function day(overrides: Partial<DailyPresence> = {}): DailyPresence {
  return {
    id: 'day-1',
    userId: 'user-1',
    subjectType: 'EMPLOYEE',
    date: '2026-08-10',
    checkInAt: '2026-08-10T07:05:00.000Z',
    checkOutAt: null,
    checkInSource: 'SCAN',
    checkOutSource: null,
    status: 'LATE',
    statusSource: 'SCAN',
    lateMinutes: 5,
    earlyLeaveMinutes: 0,
    note: null,
    holder: { id: 'user-1', identifier: '19850101', displayName: 'Ahmad' },
    corrected: false,
    ...overrides,
  }
}

describe('employeeAttendanceService', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(employeeAttendanceApi.getDay).mockResolvedValue({
      data: { data: [day()], meta: { total: 1, page: 1, limit: 200 } },
    } as never)
  })

  it('loads the selected day for employees only', async () => {
    const store = useEmployeeAttendanceStore()
    store.selectedDate = '2026-08-10'

    await employeeAttendanceService.fetchDay()

    expect(employeeAttendanceApi.getDay).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-08-10', subjectType: 'EMPLOYEE' }),
    )
    expect(store.days).toHaveLength(1)
  })

  // A failed load must leave an empty table, not a stale one showing yesterday's
  // attendance under today's date.
  it('clears the list when loading fails', async () => {
    const store = useEmployeeAttendanceStore()
    store.days = [day()]
    vi.mocked(employeeAttendanceApi.getDay).mockRejectedValue(new Error('boom'))

    await employeeAttendanceService.fetchDay()

    expect(store.days).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('reloads the day after a correction so the screen matches the server', async () => {
    vi.mocked(employeeAttendanceApi.correct).mockResolvedValue({
      data: { data: day() },
    } as never)

    const ok = await employeeAttendanceService.correct('day-1', {
      status: 'PRESENT',
      reason: 'Hadir, lupa tap',
    })

    expect(ok).toBe(true)
    expect(employeeAttendanceApi.getDay).toHaveBeenCalled()
  })

  // The API refuses a self-edit and a closed period; the caller needs to know
  // it failed so the dialog stays open with the operator's input intact.
  it('reports failure without reloading when the API refuses', async () => {
    vi.mocked(employeeAttendanceApi.correct).mockRejectedValue(
      new Error('forbidden'),
    )

    const ok = await employeeAttendanceService.correct('day-1', {
      status: 'PRESENT',
      reason: 'x',
    })

    expect(ok).toBe(false)
    expect(employeeAttendanceApi.getDay).not.toHaveBeenCalled()
  })

  describe('anomalies', () => {
    // These are the rows TU has to act on, and they are invisible in a list
    // sorted by name.
    it('flags a check-in with no check-out', () => {
      const store = useEmployeeAttendanceStore()
      store.days = [
        day({ checkInAt: '2026-08-10T07:00:00.000Z', checkOutAt: null }),
      ]

      expect(store.anomalies).toHaveLength(1)
    })

    it('flags a check-out with no check-in', () => {
      const store = useEmployeeAttendanceStore()
      store.days = [
        day({ checkInAt: null, checkOutAt: '2026-08-10T14:00:00.000Z' }),
      ]

      expect(store.anomalies).toHaveLength(1)
    })

    it('leaves a complete day alone', () => {
      const store = useEmployeeAttendanceStore()
      store.days = [
        day({
          checkInAt: '2026-08-10T07:00:00.000Z',
          checkOutAt: '2026-08-10T14:00:00.000Z',
        }),
      ]

      expect(store.anomalies).toHaveLength(0)
    })

    // A day nobody attended is absence, not an anomaly — it needs no fixing,
    // only a decision.
    it('does not flag a day with neither time', () => {
      const store = useEmployeeAttendanceStore()
      store.days = [day({ checkInAt: null, checkOutAt: null })]

      expect(store.anomalies).toHaveLength(0)
    })
  })

  it('reads only the caller’s own month, with no user parameter', async () => {
    vi.mocked(employeeAttendanceApi.getMine).mockResolvedValue({
      data: { data: { year: 2026, month: 8, days: [] } },
    } as never)

    await employeeAttendanceService.fetchMine(2026, 8)

    expect(employeeAttendanceApi.getMine).toHaveBeenCalledWith({
      year: 2026,
      month: 8,
    })
  })
})
