import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  Attendance,
  AttendanceQueryParams,
  AttendanceSavePayload,
  BulkUpsertAttendancePayload,
  BulkUpsertAttendanceResult,
  AttendanceRecapItem,
  AttendanceRecapQueryParams,
  AttendanceTrendPoint,
  AttendanceTrendQueryParams,
  AttendanceSuggestionResult,
} from '../types'

export const attendanceApi = {
  getAttendances: (params?: AttendanceQueryParams) => {
    return api.get<ApiPaginatedResponse<Attendance>>('/attendances', {
      params,
    })
  },

  /**
   * The caller's own attendance. No student parameter exists; the server
   * resolves whose rows these are from the signed-in account.
   */
  getMyAttendances: (params?: AttendanceQueryParams) => {
    return api.get<ApiPaginatedResponse<Attendance>>('/attendances/me', {
      params,
    })
  },

  createAttendance: (payload: AttendanceSavePayload) => {
    return api.post<ApiSingleResponse<Attendance>>('/attendances', payload)
  },

  updateAttendance: (id: string, payload: Partial<AttendanceSavePayload>) => {
    return api.patch<ApiSingleResponse<Attendance>>(
      `/attendances/${id}`,
      payload,
    )
  },

  deleteAttendance: (id: string) => {
    return api.delete(`/attendances/${id}`)
  },

  bulkUpsertAttendances: (payload: BulkUpsertAttendancePayload) => {
    return api.post<ApiSingleResponse<BulkUpsertAttendanceResult>>(
      '/attendances/bulk',
      payload,
    )
  },

  getRecap: (params: AttendanceRecapQueryParams) => {
    return api.get<ApiSingleResponse<AttendanceRecapItem[]>>(
      '/attendances/recap',
      { params },
    )
  },

  getMonthlyTrend: (params: AttendanceTrendQueryParams) => {
    return api.get<ApiSingleResponse<AttendanceTrendPoint[]>>(
      '/attendances/recap/trend',
      { params },
    )
  },

  /**
   * What the gate saw for this class today. Read-only — the teacher's save is
   * still the only thing that writes a per-lesson record.
   */
  getGateSuggestions: (params: {
    classroomId: string
    semesterId: string
    date: string
  }) => {
    return api.get<ApiSingleResponse<AttendanceSuggestionResult>>(
      '/attendances/suggestions',
      { params },
    )
  },
}
