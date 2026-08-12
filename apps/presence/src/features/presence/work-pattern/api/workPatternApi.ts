import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  AttendancePeriod,
  NonWorkingDay,
  WorkPattern,
  WorkPatternAssignment,
  WorkPatternDay,
} from '../types'

export const workPatternApi = {
  getPatterns: () =>
    api.get<ApiSingleResponse<WorkPattern[]>>('/presence/work-patterns'),

  createPattern: (payload: {
    name: string
    graceMinutes: number
    isDefault?: boolean
  }) =>
    api.post<ApiSingleResponse<WorkPattern>>(
      '/presence/work-patterns',
      payload,
    ),

  updatePattern: (
    id: string,
    payload: Partial<{
      name: string
      graceMinutes: number
      isDefault: boolean
    }>,
  ) =>
    api.patch<ApiSingleResponse<WorkPattern>>(
      `/presence/work-patterns/${id}`,
      payload,
    ),

  deletePattern: (id: string) => api.delete(`/presence/work-patterns/${id}`),

  /** All seven weekdays at once — the API refuses a partial week. */
  replaceDays: (id: string, days: WorkPatternDay[]) =>
    api.put<ApiSingleResponse<WorkPatternDay[]>>(
      `/presence/work-patterns/${id}/days`,
      { days },
    ),

  getAssignments: (userId?: string) =>
    api.get<ApiSingleResponse<WorkPatternAssignment[]>>(
      '/presence/work-pattern-assignments',
      { params: userId ? { userId } : undefined },
    ),

  assign: (payload: {
    userId: string
    workPatternId: string
    effectiveFrom: string
  }) =>
    api.post<ApiSingleResponse<WorkPatternAssignment>>(
      '/presence/work-pattern-assignments',
      payload,
    ),

  getNonWorkingDays: (params?: { from?: string; to?: string }) =>
    api.get<ApiSingleResponse<NonWorkingDay[]>>('/presence/non-working-days', {
      params,
    }),

  bulkNonWorkingDays: (
    days: { date: string; name: string; sourceCalendarId?: string }[],
  ) =>
    api.post<ApiSingleResponse<{ imported: number; skipped: number }>>(
      '/presence/non-working-days/bulk',
      { days },
    ),

  deleteNonWorkingDay: (id: string) =>
    api.delete(`/presence/non-working-days/${id}`),

  getPeriods: (year?: number) =>
    api.get<ApiSingleResponse<AttendancePeriod[]>>('/presence/periods', {
      params: year ? { year } : undefined,
    }),

  closePeriod: (year: number, month: number) =>
    api.post<ApiSingleResponse<AttendancePeriod>>(
      `/presence/periods/${year}/${month}/close`,
      {},
    ),
}
