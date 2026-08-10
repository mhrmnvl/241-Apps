import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { attendanceApi } from '../api/attendanceApi'
import { attendanceService } from '../services/attendanceService'
import { useAttendanceStore } from '../stores/attendanceStore'

vi.mock('../api/attendanceApi', () => ({
  attendanceApi: {
    getAttendances: vi.fn(),
    getGateSuggestions: vi.fn(),
    bulkUpsert: vi.fn(),
    getRecap: vi.fn(),
    getMonthlyTrend: vi.fn(),
  },
}))

vi.mock('@/features/academic/classroom', () => ({
  classroomApi: { getClassrooms: vi.fn() },
  studentEnrollmentApi: { getEnrollments: vi.fn() },
}))

vi.mock('@/features/academic/semester', () => ({
  semesterApi: { getSemesters: vi.fn() },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const { studentEnrollmentApi } = await import('@/features/academic/classroom')

function enrollment(id: string, name: string) {
  return {
    id,
    student: { nis: `nis-${id}`, user: { profile: { name } } },
  }
}

async function loadWith(options: {
  existing?: unknown[]
  suggestions?: unknown[]
  unscanned?: string[]
  available?: boolean
  gateFails?: boolean
}) {
  vi.mocked(studentEnrollmentApi.getEnrollments).mockResolvedValue({
    data: {
      data: [
        enrollment('enr-1', 'Ahmad'),
        enrollment('enr-2', 'Budi'),
        enrollment('enr-3', 'Citra'),
      ],
    },
  } as never)

  vi.mocked(attendanceApi.getAttendances).mockResolvedValue({
    data: { data: options.existing ?? [] },
  } as never)

  if (options.gateFails) {
    vi.mocked(attendanceApi.getGateSuggestions).mockRejectedValue(
      new Error('presence down'),
    )
  } else {
    vi.mocked(attendanceApi.getGateSuggestions).mockResolvedValue({
      data: {
        data: {
          date: '2026-08-10',
          suggestions: options.suggestions ?? [],
          unscannedEnrollmentIds: options.unscanned ?? [],
          available: options.available ?? true,
        },
      },
    } as never)
  }

  const store = useAttendanceStore()
  store.selectedClassroomId = 'cls-1'
  store.selectedSemesterId = 'sem-1'
  store.selectedDate = '2026-08-10'

  await attendanceService.loadAttendanceInput()
  return store
}

describe('gate suggestion merge', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('pre-fills a scanned student and flags the row as unconfirmed', async () => {
    const store = await loadWith({
      suggestions: [
        {
          enrollmentId: 'enr-1',
          suggestedStatus: 'PRESENT',
          checkInAt: null,
          lateMinutes: 0,
        },
      ],
      unscanned: ['enr-2', 'enr-3'],
    })

    const row = store.inputRows.find((r) => r.enrollmentId === 'enr-1')
    expect(row?.status).toBe('PRESENT')
    expect(row?.fromGate).toBe(true)
    expect(row?.needsDecision).toBe(false)
  })

  it('carries a late arrival through as LATE with its time', async () => {
    const store = await loadWith({
      suggestions: [
        {
          enrollmentId: 'enr-1',
          suggestedStatus: 'LATE',
          checkInAt: '2026-08-10T07:25:00.000Z',
          lateMinutes: 15,
        },
      ],
      unscanned: ['enr-2', 'enr-3'],
    })

    const row = store.inputRows.find((r) => r.enrollmentId === 'enr-1')
    expect(row?.status).toBe('LATE')
    expect(row?.gateCheckInAt).toBe('2026-08-10T07:25:00.000Z')
  })

  // FR-018: the gate being silent is not evidence of absence.
  it('flags an unscanned student as needing a decision', async () => {
    const store = await loadWith({ unscanned: ['enr-1', 'enr-2', 'enr-3'] })

    expect(store.inputRows.every((row) => row.needsDecision)).toBe(true)
    expect(store.inputRows.every((row) => row.fromGate)).toBe(false)
  })

  // Research R6: a late gate flush must never overwrite a decision the teacher
  // already made. A saved record always wins.
  it('lets a saved record beat the gate suggestion', async () => {
    const store = await loadWith({
      existing: [
        { id: 'att-1', enrollmentId: 'enr-1', status: 'SICK', note: 'Demam' },
      ],
      suggestions: [
        {
          enrollmentId: 'enr-1',
          suggestedStatus: 'PRESENT',
          checkInAt: null,
          lateMinutes: 0,
        },
      ],
      unscanned: ['enr-2', 'enr-3'],
    })

    const row = store.inputRows.find((r) => r.enrollmentId === 'enr-1')
    expect(row?.status).toBe('SICK')
    expect(row?.note).toBe('Demam')
    expect(row?.fromGate).toBe(false)
    expect(row?.existingId).toBe('att-1')
  })

  it('does not flag a saved record as needing a decision', async () => {
    const store = await loadWith({
      existing: [
        { id: 'att-1', enrollmentId: 'enr-1', status: 'ABSENT', note: '' },
      ],
      unscanned: ['enr-1', 'enr-2', 'enr-3'],
    })

    const row = store.inputRows.find((r) => r.enrollmentId === 'enr-1')
    expect(row?.needsDecision).toBe(false)
  })

  describe('when the gate is unreachable', () => {
    // A degraded convenience, not a degraded record. The screen behaves exactly
    // as it did before this feature existed.
    it('still renders every student', async () => {
      const store = await loadWith({ gateFails: true })

      expect(store.inputRows).toHaveLength(3)
      expect(store.inputRows.every((row) => row.fromGate)).toBe(false)
    })

    it('records that the gate was unavailable so the screen can say so', async () => {
      const store = await loadWith({ gateFails: true })

      expect(store.gateAvailable).toBe(false)
    })

    it('reports availability on the happy path', async () => {
      const store = await loadWith({ unscanned: [], available: true })

      expect(store.gateAvailable).toBe(true)
    })
  })
})
