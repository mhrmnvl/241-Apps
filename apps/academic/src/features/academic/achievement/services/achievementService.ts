import { useAchievementStore } from '../stores/achievementStore'
import { achievementApi } from '../api/achievementApi'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type { AchievementSavePayload } from '../types'

export const achievementService = {
  /**
   * The school-wide list.
   *
   * Paginated server-side rather than read whole: achievements accumulate one
   * per student per competition and are the one list here with no natural
   * ceiling, so this is a table, not a dropdown.
   */
  fetchAchievements: async () => {
    const store = useAchievementStore()
    store.loading = true
    try {
      const res = await achievementApi.getAllAchievements({
        page: store.currentPage,
        limit: store.pageSize,
        ...(store.selectedTypeId ? { typeId: store.selectedTypeId } : {}),
        ...(store.selectedYear ? { year: Number(store.selectedYear) } : {}),
      })
      store.items = res.data.data ?? []
      store.totalItems = res.data.meta?.total ?? store.items.length
    } catch (err: unknown) {
      toast.error('Gagal memuat data prestasi', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
    } finally {
      store.loading = false
    }
  },

  saveAchievement: async (
    payload: AchievementSavePayload | Omit<AchievementSavePayload, 'profileId'>,
    isCreate: boolean,
    itemId?: string,
  ) => {
    const store = useAchievementStore()
    store.isSaving = true
    try {
      if (isCreate) {
        await achievementApi.createAchievement(
          payload as AchievementSavePayload,
        )
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
