import { useAchievementStore } from '../stores/achievementStore'
import { achievementApi } from '../api/achievementApi'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type { AchievementSavePayload } from '../types'

export const achievementService = {
  saveAchievement: async (
    payload: AchievementSavePayload,
    isCreate: boolean,
    itemId?: string,
  ) => {
    const store = useAchievementStore()
    store.isSaving = true
    try {
      if (isCreate) {
        await achievementApi.createAchievement(payload)
        toast.success('Prestasi berhasil ditambahkan')
      } else {
        await achievementApi.updateAchievement(itemId!, payload)
        toast.success('Prestasi berhasil diperbarui')
      }
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal menyimpan prestasi', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  deleteAchievement: async (id: string) => {
    try {
      await achievementApi.deleteAchievement(id)
      toast.success('Prestasi berhasil dihapus')
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal menghapus prestasi', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
      return { success: false }
    }
  },
}
