import { useEducationalHistoryStore } from '../stores/educationalHistoryStore'
import { educationalHistoryApi } from '../api/educationalHistoryApi'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { educationService } from '@/features/academic/education'
import type {
  EducationalHistoryCreatePayload,
  EducationalHistoryUpdatePayload,
} from '../types'

export const educationalHistoryService = {
  saveEducationalHistory: async (
    payload: EducationalHistoryCreatePayload | EducationalHistoryUpdatePayload,
    isCreate: boolean,
    itemId?: string,
  ) => {
    const store = useEducationalHistoryStore()
    store.isSaving = true
    try {
      if (isCreate) {
        await educationalHistoryApi.createEducationalHistory(
          payload as EducationalHistoryCreatePayload,
        )
        toast.success('Riwayat pendidikan berhasil ditambahkan')
      } else {
        await educationalHistoryApi.updateEducationalHistory(itemId!, payload)
        toast.success('Riwayat pendidikan berhasil diperbarui')
      }
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal menyimpan riwayat pendidikan', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  deleteEducationalHistory: async (id: string) => {
    try {
      await educationalHistoryApi.deleteEducationalHistory(id)
      toast.success('Riwayat pendidikan berhasil dihapus')
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal menghapus riwayat pendidikan', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
      return { success: false }
    }
  },

  getEducationLevels: async () => {
    try {
      return await educationService.getEducationLevels()
    } catch {
      return []
    }
  },
}
