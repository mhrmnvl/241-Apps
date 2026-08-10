import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { occupationApi } from '../api/occupationApi'
import type {
  Occupation,
  OccupationCreatePayload,
  OccupationUpdatePayload,
} from '../types'

export const occupationService = {
  getOccupations: async (): Promise<Occupation[]> => {
    try {
      const res = await occupationApi.getOccupations({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      return res.data.data
    } catch {
      return []
    }
  },

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
}
