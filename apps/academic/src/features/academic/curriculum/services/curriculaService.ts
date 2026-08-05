import { curriculaApi } from '../api/curriculaApi'
import { academicYearApi } from '@/features/academic/academic-year'
import { useCurriculaStore } from '../stores/curriculaStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type { CurriculaSavePayload } from '../types'

export const curriculaService = {
  /**
   * Omitting `academicYearId` means "the active year" on the backend, so the
   * list stays scoped to one year instead of spanning all of them.
   */
  fetchCurricula: async (academicYearId?: string) => {
    const store = useCurriculaStore()
    store.loading = true
    try {
      const res = await curriculaApi.getCurricula({
        limit: 100,
        academicYearId,
      })
      store.curricula = res.data.data ?? []
      store.totalCurricula = res.data.meta?.total ?? store.curricula.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data kurikulum.'),
      )
    } finally {
      store.loading = false
    }
  },

  fetchAcademicYears: async () => {
    const store = useCurriculaStore()
    try {
      const res = await academicYearApi.getAcademicYears({ limit: 100 })
      store.academicYears = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tahun ajaran.'),
      )
    }
  },

  saveCurriculum: async (id: string | null, payload: CurriculaSavePayload) => {
    const store = useCurriculaStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await curriculaApi.updateCurriculum(id, payload)
      } else {
        await curriculaApi.createCurriculum(payload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan kurikulum.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteCurriculum: async (id: string) => {
    try {
      await curriculaApi.deleteCurriculum(id)
      toast.success('Kurikulum berhasil dihapus.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(error, 'Gagal menghapus kurikulum.')
      toast.error(msg)
      return { success: false, error: msg }
    }
  },
}
