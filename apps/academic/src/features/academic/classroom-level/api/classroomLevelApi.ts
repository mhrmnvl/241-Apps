import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  ClassroomLevel,
  ClassroomLevelQueryParams,
  ClassroomLevelSavePayload,
} from '../types'

export const classroomLevelApi = {
  getClassroomLevels: (params?: ClassroomLevelQueryParams) =>
    api.get<ApiPaginatedResponse<ClassroomLevel>>('/grades', {
      params,
    }),

  getClassroomLevel: (id: string) =>
    api.get<ApiSingleResponse<ClassroomLevel>>(`/grades/${id}`),

  createClassroomLevel: (payload: ClassroomLevelSavePayload) =>
    api.post<ApiSingleResponse<ClassroomLevel>>('/grades', payload),

  updateClassroomLevel: (id: string, payload: ClassroomLevelSavePayload) =>
    api.patch<ApiSingleResponse<ClassroomLevel>>(`/grades/${id}`, payload),

  deleteClassroomLevel: (id: string) => api.delete(`/grades/${id}`),
}
