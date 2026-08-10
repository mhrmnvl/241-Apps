import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  CorrectPresencePayload,
  CreatePresencePayload,
  DailyPresence,
  DailyPresenceDetail,
  MyPresence,
  PresenceRecap,
} from '../types'

interface DayQuery {
  date: string
  subjectType?: 'STUDENT' | 'EMPLOYEE'
  status?: string
  page?: number
  limit?: number
}

interface RecapQuery {
  year: number
  month: number
  subjectType?: 'STUDENT' | 'EMPLOYEE'
}

export const employeeAttendanceApi = {
  getDay: (params: DayQuery) =>
    api.get<ApiPaginatedResponse<DailyPresence>>('/presence/daily-records', {
      params,
    }),

  getDetail: (id: string) =>
    api.get<ApiSingleResponse<DailyPresenceDetail>>(
      `/presence/daily-records/${id}`,
    ),

  /** No userId parameter exists — the API resolves it from the session. */
  getMine: (params?: { year?: number; month?: number }) =>
    api.get<ApiSingleResponse<MyPresence>>('/presence/daily-records/me', {
      params,
    }),

  getRecap: (params: RecapQuery) =>
    api.get<ApiSingleResponse<PresenceRecap>>('/presence/daily-records/recap', {
      params,
    }),

  exportRecap: (params: RecapQuery) =>
    api.get<ApiSingleResponse<Record<string, string | number>[]>>(
      '/presence/daily-records/recap/export',
      { params },
    ),

  create: (payload: CreatePresencePayload) =>
    api.post<ApiSingleResponse<DailyPresence>>(
      '/presence/daily-records',
      payload,
    ),

  correct: (id: string, payload: CorrectPresencePayload) =>
    api.patch<ApiSingleResponse<DailyPresence>>(
      `/presence/daily-records/${id}`,
      payload,
    ),
}
