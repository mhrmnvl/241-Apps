import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  ActiveWave,
  AdmissionAnnouncement,
  AdmissionApplication,
  AdmissionApplicationListItem,
  AdmissionDocument,
  AdmissionDocumentType,
  AdmissionNotification,
  AdmissionPayment,
  AdmissionStats,
  AdmissionWaveSummary,
  AnnouncementSavePayload,
  RegisterPayload,
  UpdateApplicationPayload,
  WaveSavePayload,
} from '../types'

export const admissionApi = {
  // ── Public ──
  getActiveWaves: () =>
    api.get<
      ApiSingleResponse<{
        waves: ActiveWave[]
        documentTypes: AdmissionDocumentType[]
      }>
    >('/admissions/waves/active'),

  register: (payload: RegisterPayload) =>
    api.post<
      ApiSingleResponse<{
        id: string
        registrationNumber: string
        identifier: string
      }>
    >('/admissions/register', payload),

  // ── Applicant ──
  getMyApplication: () =>
    api.get<ApiSingleResponse<AdmissionApplication>>(
      '/admissions/my-application',
    ),

  updateMyApplication: (payload: UpdateApplicationPayload) =>
    api.patch<ApiSingleResponse<AdmissionApplication>>(
      '/admissions/my-application',
      payload,
    ),

  submitMyApplication: () =>
    api.post<ApiSingleResponse<AdmissionApplication>>(
      '/admissions/my-application/submit',
    ),

  uploadDocument: (typeCode: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.put<ApiSingleResponse<AdmissionDocument>>(
      `/admissions/my-application/documents/${typeCode}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },

  uploadPaymentProof: (
    payload: {
      bankName: string
      senderAccountName: string
      transferDate?: string
    },
    file: File,
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bankName', payload.bankName)
    formData.append('senderAccountName', payload.senderAccountName)
    if (payload.transferDate) {
      formData.append('transferDate', payload.transferDate)
    }
    return api.put<ApiSingleResponse<AdmissionPayment>>(
      '/admissions/my-application/payment',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },

  getMyNotifications: () =>
    api.get<
      ApiSingleResponse<{ data: AdmissionNotification[]; unreadCount: number }>
    >('/admissions/my-application/notifications'),

  markNotificationRead: (id: string) =>
    api.patch<ApiSingleResponse<AdmissionNotification>>(
      `/admissions/notifications/${id}/read`,
    ),

  markAllNotificationsRead: () =>
    api.patch<ApiSingleResponse<{ success: boolean }>>(
      '/admissions/notifications/read-all',
    ),

  getAnnouncements: () =>
    api.get<ApiSingleResponse<AdmissionAnnouncement[]>>(
      '/admissions/announcements',
    ),

  // ── Admin ──
  getStats: (waveId?: string) =>
    api.get<ApiSingleResponse<AdmissionStats>>('/admissions/stats', {
      params: waveId ? { waveId } : undefined,
    }),

  getApplications: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    waveId?: string
  }) =>
    api.get<ApiPaginatedResponse<AdmissionApplicationListItem>>(
      '/admissions/applications',
      { params },
    ),

  getApplicationById: (id: string) =>
    api.get<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/${id}`,
    ),

  verifyDocument: (
    applicationId: string,
    documentId: string,
    payload: { status: 'APPROVED' | 'REJECTED'; note?: string },
  ) =>
    api.patch<ApiSingleResponse<AdmissionDocument>>(
      `/admissions/applications/${applicationId}/documents/${documentId}/verify`,
      payload,
    ),

  verifyPayment: (
    applicationId: string,
    payload: { status: 'VERIFIED' | 'REJECTED'; note?: string },
  ) =>
    api.patch<ApiSingleResponse<AdmissionPayment>>(
      `/admissions/applications/${applicationId}/payment/verify`,
      payload,
    ),

  requestRevision: (applicationId: string, note: string) =>
    api.post<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/${applicationId}/request-revision`,
      { note },
    ),

  verifyApplication: (applicationId: string) =>
    api.post<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/${applicationId}/verify`,
    ),

  acceptApplication: (applicationId: string, note?: string) =>
    api.post<
      ApiSingleResponse<AdmissionApplication & { quotaWarning: string | null }>
    >(`/admissions/applications/${applicationId}/accept`, { note }),

  rejectApplication: (applicationId: string, reason: string) =>
    api.post<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/${applicationId}/reject`,
      { reason },
    ),

  enrollApplicant: (
    applicationId: string,
    payload: {
      nis: string
      nisn: string
      gradeId?: string
      classroomId?: string
    },
  ) =>
    api.post<ApiSingleResponse<unknown>>(
      `/admissions/applications/${applicationId}/enroll`,
      payload,
    ),

  // ── Waves (admin) ──
  getWaves: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiPaginatedResponse<AdmissionWaveSummary>>('/admissions/waves', {
      params,
    }),

  createWave: (payload: WaveSavePayload) =>
    api.post<ApiSingleResponse<AdmissionWaveSummary>>(
      '/admissions/waves',
      payload,
    ),

  updateWave: (id: string, payload: Partial<WaveSavePayload>) =>
    api.patch<ApiSingleResponse<AdmissionWaveSummary>>(
      `/admissions/waves/${id}`,
      payload,
    ),

  deleteWave: (id: string) => api.delete<void>(`/admissions/waves/${id}`),

  // ── Announcements (admin) ──
  getManageAnnouncements: (params?: {
    page?: number
    limit?: number
    search?: string
  }) =>
    api.get<ApiPaginatedResponse<AdmissionAnnouncement>>(
      '/admissions/manage-announcements',
      { params },
    ),

  createAnnouncement: (payload: AnnouncementSavePayload) =>
    api.post<ApiSingleResponse<AdmissionAnnouncement>>(
      '/admissions/manage-announcements',
      payload,
    ),

  updateAnnouncement: (id: string, payload: Partial<AnnouncementSavePayload>) =>
    api.patch<ApiSingleResponse<AdmissionAnnouncement>>(
      `/admissions/manage-announcements/${id}`,
      payload,
    ),

  publishAnnouncement: (id: string) =>
    api.post<ApiSingleResponse<AdmissionAnnouncement>>(
      `/admissions/manage-announcements/${id}/publish`,
    ),

  deleteAnnouncement: (id: string) =>
    api.delete<void>(`/admissions/manage-announcements/${id}`),
}
