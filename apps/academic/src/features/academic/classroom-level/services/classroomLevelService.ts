import { classroomLevelApi } from '../api/classroomLevelApi'
import { useClassroomLevelStore } from '../stores/classroomLevelStore'
import type { ClassroomLevelSavePayload } from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const classroomLevelService = {
  fetchClassroomLevels: async () => {
    const store = useClassroomLevelStore()
    store.loading = true
    try {
      const res = await classroomLevelApi.getClassroomLevels({
        page: 1,
        limit: 100,
      })
      store.items = res.data.data
      store.totalItems = res.data.meta?.total ?? res.data.data.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tingkat kelas.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveClassroomLevel: async (
    id: string | null,
    payload: ClassroomLevelSavePayload,
  ) => {
    const store = useClassroomLevelStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await classroomLevelApi.updateClassroomLevel(id, payload)
      } else {
        await classroomLevelApi.createClassroomLevel(payload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan tingkat kelas.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteClassroomLevel: async (id: string) => {
    try {
      await classroomLevelApi.deleteClassroomLevel(id)
      toast.success('Tingkat kelas berhasil dihapus.')
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus tingkat kelas.'),
      )
      return { success: false }
    }
  },
}
