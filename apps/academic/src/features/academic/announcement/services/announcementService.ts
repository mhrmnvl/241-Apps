import { announcementApi } from '../api/announcementApi'
import { useAnnouncementStore } from '../stores/announcementStore'
import type { AnnouncementSavePayload } from '../types'
import { classroomApi } from '@/features/academic/classroom'
import { useRoleGuard } from '@/features/platform/auth'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'

export const announcementService = {
  /**
   * The classes a notice can be addressed to.
   *
   * Only for somebody who may read the register of classes. A student holds
   * `classrooms.read-own` and not `classrooms.read`, so asking anyway answered
   * with a refusal and a toast reading "Gagal memuat data kelas" on every
   * visit to the noticeboard — an error about a filter they were never going
   * to be shown.
   */
  fetchFilterOptions: async () => {
    const store = useAnnouncementStore()
    const { can } = useRoleGuard()
    if (!can('classrooms.read')) {
      store.classrooms = []
      return
    }

    try {
      const classroomRes = await classroomApi.getClassrooms({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
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
        page: store.currentPage,
        limit: store.pageSize,
        ...(store.selectedClassroomId
          ? { classroomId: store.selectedClassroomId }
          : {}),
        ...(store.searchQuery ? { search: store.searchQuery } : {}),
      }
      // Whoever keeps the noticeboard reads all of it; everyone else reads
      // what is addressed to them. Decided by permission because that is what
      // the two endpoints are guarded by — and the `-own` route ignores any
      // classroom, so there is nothing to leak by asking.
      const { can } = useRoleGuard()
      const res = can('announcements.read')
        ? await announcementApi.getAnnouncements(params)
        : await announcementApi.getMyAnnouncements(params)
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
