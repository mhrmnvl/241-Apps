import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { occupationApi } from '../api/occupationApi'
import type {
  OccupationCreatePayload,
  OccupationUpdatePayload,
  OccupationQuery,
} from '../types'

export const occupationService = {
  createOccupation: async (payload: OccupationCreatePayload) => {
    try {
      await occupationApi.createOccupation(payload)
      toast.success('Pekerjaan berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan pekerjaan'),
      )
      return false
    }
  },

  updateOccupation: async (id: string, payload: OccupationUpdatePayload) => {
    try {
      await occupationApi.updateOccupation(id, payload)
      toast.success('Data pekerjaan berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui pekerjaan'),
      )
      return false
    }
  },

  async deleteOccupation(
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) {
    if (callbacks) callbacks.setLoading(true)
    try {
      await occupationApi.deleteOccupation(id)
      toast.success('Berhasil menghapus data pekerjaan')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus data pekerjaan'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },

  fetchOccupations: async (params?: OccupationQuery) => {
    const res = await occupationApi.getOccupations(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
