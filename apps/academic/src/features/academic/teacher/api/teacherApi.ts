import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  TeacherQueryParams,
  TeacherExportParams,
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherPositionSavePayload,
  TeacherPositionUpdatePayload,
  Teacher,
  BulkImportResult,
  PositionListItem,
} from '../types'

export const teacherApi = {
  getTeachers: (params?: TeacherQueryParams) => {
    return api.get<ApiPaginatedResponse<Teacher>>('/teachers', { params })
  },

  getTeacher: (id: string) => {
    return api.get<ApiSingleResponse<Teacher>>(`/teachers/${id}`)
  },

  getTeachersByUserId: (userId: string) => {
    return api.get<ApiPaginatedResponse<Teacher>>('/teachers', {
      params: { userId, limit: 1 },
    })
  },

  createTeacher: (payload: TeacherSavePayload) => {
    return api.post<ApiSingleResponse<Teacher>>('/teachers', payload)
  },

  updateTeacher: (id: string, payload: TeacherUpdatePayload) => {
    return api.patch<ApiSingleResponse<Teacher>>(`/teachers/${id}`, payload)
  },

  deleteTeacher: (id: string) => {
    return api.delete(`/teachers/${id}`)
  },

  toggleActive: (id: string, isActive: boolean) => {
    return api.patch<ApiSingleResponse<Teacher>>(
      `/teachers/${id}/toggle-active`,
      null,
      {
        params: { isActive },
      },
    )
  },

  exportTeachers: (params?: TeacherExportParams) => {
    return api.get<ArrayBuffer>('/teachers/export', {
      params,
      responseType: 'arraybuffer',
    })
  },

  getImportTemplate: () => {
    return api.get<ArrayBuffer>('/teachers/import-template', {
      responseType: 'arraybuffer',
    })
  },

  bulkImport: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiSingleResponse<BulkImportResult>>(
      '/teachers/bulk-import',
      formData,
    )
  },

  getPositions: (params?: { limit?: number; isActive?: boolean }) => {
    return api.get<ApiPaginatedResponse<PositionListItem>>('/positions', {
      params,
    })
  },

  createPosition: (teacherId: string, payload: TeacherPositionSavePayload) => {
    return api.post<ApiSingleResponse<Teacher>>(`/teacher-positions`, payload, {
      params: { teacherId },
    })
  },

  updatePosition: (
    teacherId: string,
    positionId: string,
    payload: TeacherPositionUpdatePayload,
  ) => {
    return api.patch<ApiSingleResponse<Teacher>>(
      `/teacher-positions/${positionId}`,
      payload,
      { params: { teacherId } },
    )
  },

  deletePosition: (teacherId: string, positionId: string) => {
    return api.delete(`/teacher-positions/${positionId}`, {
      params: { teacherId },
    })
  },
}
