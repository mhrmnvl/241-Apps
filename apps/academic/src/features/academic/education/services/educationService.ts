import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { educationApi } from '../api/educationApi'
import type {
  EducationLevel,
  EducationLevelCreatePayload,
  EducationLevelUpdatePayload,
  EducationLevelQuery,
} from '../types'

const FALLBACK_LEVELS: EducationLevel[] = [
  { id: 'SD', name: 'SD / Sederajat', isActive: true },
  { id: 'SMP', name: 'SMP / Sederajat', isActive: true },
  { id: 'SMA', name: 'SMA / SMK / Sederajat', isActive: true },
  { id: 'D3', name: 'Diploma III (D3)', isActive: true },
  { id: 'S1', name: 'Sarjana (S1)', isActive: true },
  { id: 'S2', name: 'Magister (S2)', isActive: true },
  { id: 'S3', name: 'Doktor (S3)', isActive: true },
]

export const educationService = {
  getEducationLevels: async (): Promise<EducationLevel[]> => {
    try {
      const res = await educationApi.getEducationLevels({ limit: 100 })
      return res.data.data
    } catch {
      return FALLBACK_LEVELS
    }
  },

  createEducationLevel: async (payload: EducationLevelCreatePayload) => {
    try {
      await educationApi.createEducationLevel(payload)
      toast.success('Tingkat pendidikan berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal menambahkan tingkat pendidikan',
        ),
      )
      return false
    }
  },

  updateEducationLevel: async (
    id: string,
    payload: EducationLevelUpdatePayload,
  ) => {
    try {
      await educationApi.updateEducationLevel(id, payload)
      toast.success('Tingkat pendidikan berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal memperbarui tingkat pendidikan',
        ),
      )
      return false
    }
  },

  deleteEducationLevel: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await educationApi.deleteEducationLevel(id)
      toast.success('Berhasil menghapus tingkat pendidikan')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus tingkat pendidikan'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },

  fetchEducationLevels: async (params?: EducationLevelQuery) => {
    const res = await educationApi.getEducationLevels(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
