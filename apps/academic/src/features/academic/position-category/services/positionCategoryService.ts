import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { positionCategoryApi } from '../api/positionCategoryApi'
import type {
  PositionCategoryCreatePayload,
  PositionCategoryUpdatePayload,
  PositionCategoryQuery,
} from '../types'

export const positionCategoryService = {
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

  fetchPositionCategories: async (params?: PositionCategoryQuery) => {
    const res = await positionCategoryApi.getPositionCategories(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
