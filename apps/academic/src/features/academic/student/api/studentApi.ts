import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  StudentQueryParams,
  StudentSavePayload,
  StudentUpdatePayload,
  StudentExportParams,
  Student,
  StudentCreateResult,
  BulkImportResult,
  ResolveBulkImportConflict,
  ResolveBulkImportResult,
  CreateStudentWithRelationsInput,
} from '../types'

export const studentApi = {
  getStudents: (params?: StudentQueryParams) => {
    return api.get<ApiPaginatedResponse<Student>>('/students', { params })
  },

  getStudent: (id: string) => {
    return api.get<ApiSingleResponse<Student>>(`/students/${id}`)
  },

  getStudentsByUserId: (userId: string) => {
    return api.get<ApiPaginatedResponse<Student>>('/students', {
      params: { userId, limit: 1 },
    })
  },

  createStudent: (payload: StudentSavePayload) => {
    return api.post<ApiSingleResponse<StudentCreateResult>>(
      '/students',
      payload,
    )
  },

  createStudentWithRelations: (payload: CreateStudentWithRelationsInput) => {
    return api.post<ApiSingleResponse<Student>>(
      '/students/with-relations',
      payload,
    )
  },

  exportStudents: (params?: StudentExportParams) => {
    return api.get<ArrayBuffer>('/students/export', {
      params,
      responseType: 'arraybuffer',
    })
  },

  bulkImport: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiSingleResponse<BulkImportResult>>(
      '/students/bulk-import',
      formData,
    )
  },

  getImportTemplate: () => {
    return api.get<ArrayBuffer>('/students/import-template', {
      responseType: 'arraybuffer',
    })
  },

  resolveBulkImportConflicts: (conflicts: ResolveBulkImportConflict[]) => {
    return api.post<ApiSingleResponse<ResolveBulkImportResult>>(
      '/students/bulk-import/resolve',
      { conflicts },
    )
  },

  updateStudentAccount: (id: string, payload: StudentUpdatePayload) => {
    return api.patch<ApiSingleResponse<Student>>(`/students/${id}`, payload)
  },

  deleteStudent: (id: string) => {
    return api.delete(`/students/${id}`)
  },

  getStudentParents: (studentId: string) => {
    return api.get<ApiPaginatedResponse<Student>>('/student-parents', {
      params: { studentId },
    })
  },

  toggleActive: (id: string, isActive: boolean) => {
    return api.patch<ApiSingleResponse<Student>>(
      `/students/${id}/toggle-active`,
      {},
      { params: { isActive } },
    )
  },
}
