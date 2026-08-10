import { beforeEach, describe, expect, it, vi } from 'vitest'
import { leaveApi } from '../api/leaveApi'
import {
  balances,
  leaveService,
  myRequests,
  pendingRequests,
  requests,
} from '../services/leaveService'
import type { LeaveRequest } from '../types'

vi.mock('../api/leaveApi', () => ({
  leaveApi: {
    getTypes: vi.fn(),
    getRequests: vi.fn(),
    getMyRequests: vi.fn(),
    submit: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    withdraw: vi.fn(),
    getMyBalances: vi.fn(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

function request(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: 'req-1',
    requesterId: 'user-1',
    leaveTypeId: 'type-1',
    startDate: '2026-09-01',
    endDate: '2026-09-02',
    reason: 'Keperluan keluarga',
    documentFileId: null,
    status: 'PENDING',
    decidedAt: null,
    decisionReason: null,
    workingDayCount: 2,
    createdAt: '2026-08-20T00:00:00.000Z',
    requester: { id: 'user-1', displayName: 'Ahmad' },
    approver: null,
    leaveType: {
      id: 'type-1',
      code: 'CUTI_TAHUNAN',
      name: 'Cuti Tahunan',
      treatment: 'ON_LEAVE',
    },
    days: ['2026-09-01', '2026-09-02'],
    ...overrides,
  }
}

describe('leaveService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requests.value = []
    myRequests.value = []
    balances.value = []
    vi.mocked(leaveApi.getRequests).mockResolvedValue({
      data: { data: [] },
    } as never)
    vi.mocked(leaveApi.getMyRequests).mockResolvedValue({
      data: { data: [] },
    } as never)
    vi.mocked(leaveApi.getMyBalances).mockResolvedValue({
      data: { data: [] },
    } as never)
  })

  // What an approver actually has to act on — a decided request is history.
  it('narrows the approval queue to pending requests', async () => {
    vi.mocked(leaveApi.getRequests).mockResolvedValue({
      data: {
        data: [
          request({ id: 'a', status: 'PENDING' }),
          request({ id: 'b', status: 'APPROVED' }),
          request({ id: 'c', status: 'REJECTED' }),
          request({ id: 'd', status: 'WITHDRAWN' }),
        ],
      },
    } as never)

    await leaveService.fetchRequests()

    expect(pendingRequests.value.map((r) => r.id)).toEqual(['a'])
  })

  it('loads requests and balances together for the own view', async () => {
    await leaveService.fetchMine(2026)

    expect(leaveApi.getMyRequests).toHaveBeenCalledWith({ year: 2026 })
    expect(leaveApi.getMyBalances).toHaveBeenCalledWith(2026)
  })

  // A failed load must leave an empty queue rather than a stale one that could
  // be approved twice.
  it('clears the list when loading fails', async () => {
    requests.value = [request()]
    vi.mocked(leaveApi.getRequests).mockRejectedValue(new Error('boom'))

    await leaveService.fetchRequests()

    expect(requests.value).toEqual([])
  })

  describe('approving', () => {
    it('reloads the queue so a decided request leaves it', async () => {
      vi.mocked(leaveApi.approve).mockResolvedValue({
        data: { data: request({ status: 'APPROVED' }) },
      } as never)

      await expect(leaveService.approve('req-1')).resolves.toBe(true)
      expect(leaveApi.getRequests).toHaveBeenCalled()
    })

    // Over quota and self-approval both come back as errors carrying a useful
    // message; the caller needs to know it failed so the row stays actionable.
    it('reports failure without reloading when the API refuses', async () => {
      vi.mocked(leaveApi.approve).mockRejectedValue(new Error('over quota'))

      await expect(leaveService.approve('req-1')).resolves.toBe(false)
      expect(leaveApi.getRequests).not.toHaveBeenCalled()
    })
  })

  it('sends the rejection reason through', async () => {
    vi.mocked(leaveApi.reject).mockResolvedValue({
      data: { data: request({ status: 'REJECTED' }) },
    } as never)

    await leaveService.reject('req-1', 'Bentrok ujian')

    expect(leaveApi.reject).toHaveBeenCalledWith('req-1', 'Bentrok ujian')
  })

  it('reloads the own view after withdrawing', async () => {
    vi.mocked(leaveApi.withdraw).mockResolvedValue({
      data: { data: request({ status: 'WITHDRAWN' }) },
    } as never)

    await leaveService.withdraw('req-1')

    expect(leaveApi.getMyRequests).toHaveBeenCalled()
  })

  it('reports a failed submission so the dialog stays open', async () => {
    vi.mocked(leaveApi.submit).mockRejectedValue(new Error('no working days'))

    await expect(
      leaveService.submit({
        leaveTypeId: 'type-1',
        startDate: '2026-09-05',
        endDate: '2026-09-06',
        reason: 'x',
      }),
    ).resolves.toBe(false)
  })
})
