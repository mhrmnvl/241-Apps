import { semesterApi } from '../api/semesterApi'
import { academicYearApi } from '@/features/academic/academic-year'
import { semesterTypeApi } from '@/features/academic/semester-type/api/semesterTypeApi'
import { useSemesterStore } from '../stores/semesterStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type {
  GenerateRecommendationPayload,
  PromotionPayload,
  RolloverSemesterPayload,
  SemesterSavePayload,
} from '../types'

export const semesterService = {
  fetchSemesters: async () => {
    const store = useSemesterStore()
    store.loading = true
    try {
      const res = await semesterApi.getSemesters({ limit: 100 })
      store.semesters = res.data.data ?? []
      store.totalSemesters = res.data.meta?.total ?? store.semesters.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data semester.'),
      )
    } finally {
      store.loading = false
    }
  },

  fetchAcademicYears: async () => {
    const store = useSemesterStore()
    try {
      const res = await academicYearApi.getAcademicYears({ limit: 100 })
      store.academicYears = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tahun ajaran.'),
      )
    }
  },

  fetchSemesterTypes: async () => {
    const store = useSemesterStore()
    try {
      const res = await semesterTypeApi.getSemesterTypes({ limit: 100 })
      store.semesterTypes = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tipe semester.'),
      )
    }
  },

  saveSemester: async (id: string | null, payload: SemesterSavePayload) => {
    const store = useSemesterStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await semesterApi.updateSemester(id, payload)
      } else {
        await semesterApi.createSemester(payload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan semester.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteSemester: async (id: string) => {
    try {
      await semesterApi.deleteSemester(id)
      toast.success('Semester berhasil dihapus.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(error, 'Gagal menghapus semester.')
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  rolloverSemester: async (payload: RolloverSemesterPayload) => {
    const store = useSemesterStore()
    store.isRollingOver = true
    store.rolloverSummary = null
    try {
      const res = await semesterApi.rolloverSemester(payload)
      store.rolloverSummary = res.data.data
      return { success: true, summary: res.data.data }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal melakukan rollover semester.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      store.isRollingOver = false
    }
  },

  activateSemester: async (id: string) => {
    try {
      await semesterApi.activateSemester(id)
      toast.success('Semester berhasil diaktifkan.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal mengaktifkan semester.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  deactivateSemester: async (id: string) => {
    try {
      await semesterApi.deactivateSemester(id)
      toast.success('Semester berhasil dinonaktifkan.')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal menonaktifkan semester.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  fetchPromotionRecommendation: async (
    payload: GenerateRecommendationPayload,
  ) => {
    const store = useSemesterStore()
    store.isLoadingRecommendations = true
    store.promotionRecommendations = []
    try {
      const res = await semesterApi.getPromotionRecommendation(payload)
      store.promotionRecommendations = res.data.items ?? []
      return { success: true, data: res.data }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal memuat rekomendasi kenaikan kelas.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      store.isLoadingRecommendations = false
    }
  },

  previewPromotion: async (payload: PromotionPayload) => {
    const store = useSemesterStore()
    store.isPromoting = true
    store.promotionPreview = null
    try {
      const res = await semesterApi.previewPromotion(payload)
      store.promotionPreview = res.data
      return { success: true, preview: res.data }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal memuat preview kenaikan kelas.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      store.isPromoting = false
    }
  },

  executePromotion: async (payload: PromotionPayload) => {
    const store = useSemesterStore()
    store.isPromoting = true
    try {
      const res = await semesterApi.executePromotion(payload)
      return { success: true, result: res.data }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal memproses kenaikan kelas.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      store.isPromoting = false
    }
  },
}
