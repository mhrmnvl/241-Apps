import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { SubjectQueryParams, SubjectSavePayload, Subject } from '../types'

export const subjectApi = {
  getSubjects: (params?: SubjectQueryParams) => {
    return api.get<ApiPaginatedResponse<Subject>>('/subjects', { params })
  },

  createSubject: (payload: SubjectSavePayload) => {
    return api.post<ApiSingleResponse<Subject>>('/subjects', payload)
  },

  updateSubject: (id: string, payload: SubjectSavePayload) => {
    return api.patch<ApiSingleResponse<Subject>>(`/subjects/${id}`, payload)
  },

  deleteSubject: (id: string) => {
    return api.delete(`/subjects/${id}`)
  },
}
