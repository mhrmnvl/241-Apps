import { gradeApi } from '../api/gradeApi'
import { useGradeStore } from '../stores/gradeStore'
import type { GradeSavePayload } from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const gradeService = {
  fetchGrades: async () => {
    const store = useGradeStore()
    store.loading = true
    try {
      const res = await gradeApi.getGrades({
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

  saveGrade: async (id: string | null, payload: GradeSavePayload) => {
    const store = useGradeStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await gradeApi.updateGrade(id, payload)
      } else {
        await gradeApi.createGrade(payload)
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

  deleteGrade: async (id: string) => {
    try {
      await gradeApi.deleteGrade(id)
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
