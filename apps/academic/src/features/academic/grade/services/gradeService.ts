import { gradeApi } from '../api/gradeApi'
import { useGradeStore } from '../stores/gradeStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type { GradeSavePayload, GradeQueryParams } from '../types'

export const gradeService = {
  fetchGrades: async (params?: GradeQueryParams) => {
    const store = useGradeStore()
    store.loading = true
    try {
      const mergedParams = {
        page: params?.page ?? store.currentFilters.page,
        limit: params?.limit ?? store.currentFilters.limit,
        search: params?.search ?? store.currentFilters.search,
      }
      store.currentFilters = mergedParams

      const res = await gradeApi.getGrades(mergedParams)
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
