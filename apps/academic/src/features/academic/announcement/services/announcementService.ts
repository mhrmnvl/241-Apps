import { announcementApi } from '../api/announcementApi'
import { useAnnouncementStore } from '../stores/announcementStore'
import type { AnnouncementSavePayload } from '../types'
import { classroomApi } from '@/features/academic/classroom'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const announcementService = {
  fetchFilterOptions: async () => {
    const store = useAnnouncementStore()
    try {
      const classroomRes = await classroomApi.getClassrooms({ limit: 100 })
      store.classrooms = classroomRes.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data kelas.'))
    }
  },

  fetchAnnouncements: async () => {
    const store = useAnnouncementStore()
    store.loading = true
    try {
      const params = {
        limit: 100,
        ...(store.selectedClassroomId
          ? { classroomId: store.selectedClassroomId }
          : {}),
        ...(store.searchQuery ? { search: store.searchQuery } : {}),
      }
      const res = await announcementApi.getAnnouncements(params)
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pengumuman.'),
      )
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
      const promise = id
        ? announcementApi.updateAnnouncement(id, payload)
        : announcementApi.createAnnouncement(payload)

      toast.promise(promise, {
        loading: id
          ? 'Menyimpan perubahan pengumuman...'
          : 'Membuat pengumuman baru...',
        success: id
          ? 'Pengumuman berhasil diperbarui.'
          : 'Pengumuman berhasil dibuat.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal menyimpan pengumuman.'),
      })

      await promise
      await announcementService.fetchAnnouncements()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan pengumuman.',
      )
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  deleteAnnouncement: async (id: string) => {
    try {
      const promise = announcementApi.deleteAnnouncement(id)
      toast.promise(promise, {
        loading: 'Menghapus pengumuman...',
        success: 'Pengumuman berhasil dihapus.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal menghapus pengumuman.'),
      })
      await promise
      await announcementService.fetchAnnouncements()
      return { success: true }
    } catch {
      return { success: false }
    }
  },
}
