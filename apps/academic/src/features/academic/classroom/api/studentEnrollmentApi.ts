import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  StudentEnrollment,
  BulkCreateEnrollmentPayload,
  TransferPayload,
  BulkTransferPayload,
  BulkTransferResponse,
  DropPayload,
  EnrollmentQueryParams,
  BulkEnrollResponse,
} from '../types'

export const studentEnrollmentApi = {
  getEnrollments: (params?: EnrollmentQueryParams) => {
    return api.get<ApiPaginatedResponse<StudentEnrollment>>(
      '/student-enrollments',
      { params },
    )
  },

  getEnrollment: (id: string) => {
    return api.get<ApiSingleResponse<StudentEnrollment>>(
      `/student-enrollments/${id}`,
    )
  },

  bulkCreateEnrollments: (payload: BulkCreateEnrollmentPayload) => {
    return api.post<ApiSingleResponse<BulkEnrollResponse>>(
      '/student-enrollments/bulk',
      payload,
    )
  },

  transferStudent: (id: string, payload: TransferPayload) => {
    return api.patch<ApiSingleResponse<StudentEnrollment>>(
      `/student-enrollments/${id}/transfer`,
      payload,
    )
  },

  bulkTransferStudents: (payload: BulkTransferPayload) => {
    return api.post<ApiSingleResponse<BulkTransferResponse>>(
      '/student-enrollments/bulk-transfer',
      payload,
    )
  },

  dropStudent: (id: string, payload: DropPayload) => {
    return api.patch<ApiSingleResponse<StudentEnrollment>>(
      `/student-enrollments/${id}/drop`,
      payload,
    )
  },

  deleteEnrollment: (id: string) => {
    return api.delete(`/student-enrollments/${id}`)
  },
}
