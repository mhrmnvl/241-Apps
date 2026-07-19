import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { achievementTypeApi } from '../api/achievementTypeApi'
import type {
  AchievementType,
  AchievementTypeCreatePayload,
  AchievementTypeUpdatePayload,
  AchievementTypeQuery,
} from '../types'

export const achievementTypeService = {
  getAchievementTypes: async (): Promise<AchievementType[]> => {
    try {
      const res = await achievementTypeApi.getAchievementTypes({ limit: 100 })
      return res.data.data
    } catch {
      return []
    }
  },

  createAchievementType: async (payload: AchievementTypeCreatePayload) => {
    try {
      await achievementTypeApi.createAchievementType(payload)
      toast.success('Tingkat Prestasi berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan tingkat prestasi'),
      )
      return false
    }
  },

  updateAchievementType: async (
    id: string,
    payload: AchievementTypeUpdatePayload,
  ) => {
    try {
      await achievementTypeApi.updateAchievementType(id, payload)
      toast.success('Tingkat Prestasi berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui tingkat prestasi'),
      )
      return false
    }
  },

  deleteAchievementType: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await achievementTypeApi.deleteAchievementType(id)
      toast.success('Berhasil menghapus tingkat prestasi')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus tingkat prestasi'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },

  fetchAchievementTypes: async (params?: AchievementTypeQuery) => {
    const res = await achievementTypeApi.getAchievementTypes(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
