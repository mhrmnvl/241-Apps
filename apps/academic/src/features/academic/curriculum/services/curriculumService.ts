import { curriculumApi } from '../api/curriculumApi'
import { academicYearApi } from '@/features/academic/academic-year'
import { useCurriculumStore } from '../stores/curriculumStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import type { CurriculumSavePayload } from '../types'

export const curriculumService = {
  /**
   * Omitting `academicYearId` means "the active year" on the backend, so the
   * list stays scoped to one year instead of spanning all of them.
   */
  fetchCurricula: async (academicYearId?: string) => {
    const store = useCurriculumStore()
    store.loading = true
    try {
      const res = await curriculumApi.getCurricula({
        limit: PAGINATION.REFERENCE_LIMIT,
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
    const store = useCurriculumStore()
    try {
      const res = await academicYearApi.getAcademicYears({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.academicYears = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tahun ajaran.'),
      )
    }
  },

  saveCurriculum: async (id: string | null, payload: CurriculumSavePayload) => {
    const store = useCurriculumStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await curriculumApi.updateCurriculum(id, payload)
      } else {
        await curriculumApi.createCurriculum(payload)
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
      await curriculumApi.deleteCurriculum(id)
      toast.success('Kurikulum berhasil dihapus.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(error, 'Gagal menghapus kurikulum.')
      toast.error(msg)
      return { success: false, error: msg }
    }
  },
}
