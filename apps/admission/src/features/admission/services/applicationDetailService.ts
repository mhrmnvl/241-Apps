import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import { useApplicationDetailStore } from '../stores/applicationDetailStore'

interface EnrollPayload {
  nis: string
  nisn: string
  gradeId?: string
  classroomId?: string
}

async function runAction(
  applicationId: string,
  action: () => Promise<unknown>,
  successMessage: string,
) {
  const store = useApplicationDetailStore()
  store.acting = true
  try {
    await action()
    toast.success(successMessage)
    await applicationDetailService.fetchDetail(applicationId)
    return { success: true }
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Aksi gagal dijalankan.'))
    return { success: false }
  } finally {
    store.acting = false
  }
}

export const applicationDetailService = {
  fetchDetail: async (id: string) => {
    const store = useApplicationDetailStore()
    store.loading = true
    try {
      const res = await admissionApi.getApplicationById(id)
      store.application = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat detail pendaftar.'),
      )
    } finally {
      store.loading = false
    }
  },

  approveDocument: (applicationId: string, documentId: string) =>
    runAction(
      applicationId,
      () =>
        admissionApi.verifyDocument(applicationId, documentId, {
          status: 'APPROVED',
        }),
      'Berkas disetujui.',
    ),

  rejectDocument: (applicationId: string, documentId: string, note: string) =>
    runAction(
      applicationId,
      () =>
        admissionApi.verifyDocument(applicationId, documentId, {
          status: 'REJECTED',
          note,
        }),
      'Berkas ditolak.',
    ),

  verifyPaymentApprove: (applicationId: string) =>
    runAction(
      applicationId,
      () => admissionApi.verifyPayment(applicationId, { status: 'VERIFIED' }),
      'Pembayaran diverifikasi.',
    ),

  rejectPayment: (applicationId: string, note: string) =>
    runAction(
      applicationId,
      () =>
        admissionApi.verifyPayment(applicationId, {
          status: 'REJECTED',
          note,
        }),
      'Bukti pembayaran ditolak.',
    ),

  requestRevision: (applicationId: string, note: string) =>
    runAction(
      applicationId,
      () => admissionApi.requestRevision(applicationId, note),
      'Pendaftaran dikembalikan untuk revisi.',
    ),

  verifyApplication: (applicationId: string) =>
    runAction(
      applicationId,
      () => admissionApi.verifyApplication(applicationId),
      'Aplikasi diverifikasi.',
    ),

  accept: async (applicationId: string, note?: string) => {
    const store = useApplicationDetailStore()
    store.acting = true
    try {
      const res = await admissionApi.acceptApplication(applicationId, note)
      const warning = res.data.data.quotaWarning
      if (warning) toast.warning(warning)
      toast.success('Pendaftar dinyatakan DITERIMA.')
      await applicationDetailService.fetchDetail(applicationId)
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Aksi gagal dijalankan.'))
      return { success: false }
    } finally {
      store.acting = false
    }
  },

  reject: (applicationId: string, reason: string) =>
    runAction(
      applicationId,
      () => admissionApi.rejectApplication(applicationId, reason),
      'Pendaftaran ditolak.',
    ),

  enroll: (applicationId: string, payload: EnrollPayload) =>
    runAction(
      applicationId,
      () => admissionApi.enrollApplicant(applicationId, payload),
      'Pendaftar berhasil diproses menjadi santri.',
    ),
}
