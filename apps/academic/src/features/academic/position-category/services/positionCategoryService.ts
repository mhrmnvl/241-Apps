import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { positionCategoryApi } from '../api/positionCategoryApi'
import type {
  PositionCategory,
  PositionCategoryCreatePayload,
  PositionCategoryUpdatePayload,
} from '../types'

export const positionCategoryService = {
  getPositionCategories: async (): Promise<PositionCategory[]> => {
    try {
      const res = await positionCategoryApi.getPositionCategories({
        limit: 100,
      })
      return res.data.data
    } catch {
      return []
    }
  },

  createPositionCategory: async (payload: PositionCategoryCreatePayload) => {
    try {
      await positionCategoryApi.createPositionCategory(payload)
      toast.success('Kategori jabatan berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan kategori jabatan'),
      )
      return false
    }
  },

  updatePositionCategory: async (
    id: string,
    payload: PositionCategoryUpdatePayload,
  ) => {
    try {
      await positionCategoryApi.updatePositionCategory(id, payload)
      toast.success('Kategori jabatan berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui kategori jabatan'),
      )
      return false
    }
  },

  deletePositionCategory: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await positionCategoryApi.deletePositionCategory(id)
      toast.success('Berhasil menghapus kategori jabatan')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus kategori jabatan'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },
}
