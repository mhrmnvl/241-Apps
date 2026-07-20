import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import { useMyApplicationStore } from '../stores/myApplicationStore'
import type { AdmissionApplication, UpdateApplicationPayload } from '../types'

interface PaymentProofPayload {
  bankName: string
  senderAccountName: string
  transferDate?: string
}

export const myApplicationService = {
  // ── Dashboard ──
  fetchDashboard: async () => {
    const store = useMyApplicationStore()
    store.loading = true
    try {
      const [appRes, notifRes, annRes] = await Promise.all([
        admissionApi.getMyApplication(),
        admissionApi.getMyNotifications(),
        admissionApi.getAnnouncements(),
      ])
      store.application = appRes.data.data
      store.notifications = notifRes.data.data.data
      store.unreadCount = notifRes.data.data.unreadCount
      store.announcements = annRes.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pendaftaran.'),
      )
    } finally {
      store.loading = false
    }
  },

  markAllRead: async () => {
    const store = useMyApplicationStore()
    try {
      await admissionApi.markAllNotificationsRead()
      store.notifications = store.notifications.map((n) => ({
        ...n,
        readAt: n.readAt ?? new Date().toISOString(),
      }))
      store.unreadCount = 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menandai notifikasi.'),
      )
    }
  },

  // ── Form (returns data for the view's local state) ──
  fetchMyApplication: async (): Promise<AdmissionApplication | null> => {
    try {
      const res = await admissionApi.getMyApplication()
      return res.data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat formulir.'))
      return null
    }
  },

  updateStep: async (payload: UpdateApplicationPayload) => {
    try {
      const res = await admissionApi.updateMyApplication(payload)
      return { success: true as const, data: res.data.data }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan formulir.'))
      return { success: false as const }
    }
  },

  uploadDocument: async (typeCode: string, file: File) => {
    try {
      await admissionApi.uploadDocument(typeCode, file)
      return { success: true as const }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengunggah berkas.'))
      return { success: false as const }
    }
  },

  uploadPaymentProof: async (payload: PaymentProofPayload, file: File) => {
    try {
      await admissionApi.uploadPaymentProof(payload, file)
      return { success: true as const }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal mengunggah bukti pembayaran.'),
      )
      return { success: false as const }
    }
  },

  submit: async () => {
    try {
      await admissionApi.submitMyApplication()
      return { success: true as const }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengirim formulir.'))
      return { success: false as const }
    }
  },
}
