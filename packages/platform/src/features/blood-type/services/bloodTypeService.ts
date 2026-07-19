import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { bloodTypeApi } from '../api/bloodTypeApi'
import type {
  BloodType,
  BloodTypeCreatePayload,
  BloodTypeUpdatePayload,
  BloodTypeQuery,
} from '../types'

export const bloodTypeService = {
  getBloodTypes: async (): Promise<BloodType[]> => {
    try {
      const res = await bloodTypeApi.getBloodTypes({ limit: 100 })
      return res.data.data
    } catch {
      return []
    }
  },

  createBloodType: async (payload: BloodTypeCreatePayload) => {
    try {
      await bloodTypeApi.createBloodType(payload)
      toast.success('Golongan Darah berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan golongan darah'),
      )
      return false
    }
  },

  updateBloodType: async (id: string, payload: BloodTypeUpdatePayload) => {
    try {
      await bloodTypeApi.updateBloodType(id, payload)
      toast.success('Golongan Darah berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui golongan darah'),
      )
      return false
    }
  },

  deleteBloodType: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await bloodTypeApi.deleteBloodType(id)
      toast.success('Berhasil menghapus golongan darah')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus golongan darah'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },

  fetchBloodTypes: async (params?: BloodTypeQuery) => {
    const res = await bloodTypeApi.getBloodTypes(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
