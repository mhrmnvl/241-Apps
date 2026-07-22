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
} from '../types'

export const attendanceApi = {
  getAttendances: (params?: AttendanceQueryParams) => {
    return api.get<ApiPaginatedResponse<Attendance>>('/attendances', {
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
}
