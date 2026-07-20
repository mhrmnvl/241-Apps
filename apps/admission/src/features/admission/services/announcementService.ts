import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import { useAnnouncementStore } from '../stores/announcementStore'
import type { AnnouncementSavePayload } from '../types'

export const announcementService = {
  fetchData: async () => {
    const store = useAnnouncementStore()
    store.loading = true
    try {
      const [annRes, waveRes] = await Promise.all([
        admissionApi.getManageAnnouncements({ limit: 100 }),
        admissionApi.getWaves({ limit: 100 }),
      ])
      store.announcements = annRes.data.data ?? []
      store.totalItems = annRes.data.meta?.total ?? store.announcements.length
      store.waves = waveRes.data.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat pengumuman.'))
    } finally {
      store.loading = false
    }
  },

  saveAnnouncement: async (
    id: string | null,
    payload: AnnouncementSavePayload,
  ) => {
    const store = useAnnouncementStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await admissionApi.updateAnnouncement(id, payload)
        toast.success('Pengumuman diperbarui.')
      } else {
        await admissionApi.createAnnouncement(payload)
        toast.success('Pengumuman dibuat (draft).')
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan pengumuman.',
      )
      toast.error(store.formError)
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  publishAnnouncement: async (id: string) => {
    try {
      await admissionApi.publishAnnouncement(id)
      toast.success('Pengumuman diterbitkan dan notifikasi dikirim.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal menerbitkan pengumuman.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  deleteAnnouncement: async (id: string) => {
    try {
      await admissionApi.deleteAnnouncement(id)
      toast.success('Pengumuman dihapus.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal menghapus pengumuman.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },
}
