import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { religionApi } from '../api/religionApi'
import type {
  Religion,
  ReligionCreatePayload,
  ReligionUpdatePayload,
} from '../types'

export const religionService = {
  getReligions: async (): Promise<Religion[]> => {
    try {
      const res = await religionApi.getReligions({ limit: 100 })
      return res.data.data
    } catch {
      return []
    }
  },

  createReligion: async (payload: ReligionCreatePayload) => {
    try {
      await religionApi.createReligion(payload)
      toast.success('Agama berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menambahkan agama'))
      return false
    }
  },

  updateReligion: async (id: string, payload: ReligionUpdatePayload) => {
    try {
      await religionApi.updateReligion(id, payload)
      toast.success('Agama berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memperbarui agama'))
      return false
    }
  },

  deleteReligion: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await religionApi.deleteReligion(id)
      toast.success('Berhasil menghapus agama')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus agama'))
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },
}
