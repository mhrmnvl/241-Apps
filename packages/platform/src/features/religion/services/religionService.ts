import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { religionApi } from '../api/religionApi'
import type {
  Religion,
  ReligionCreatePayload,
  ReligionUpdatePayload,
  ReligionQuery,
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

  fetchReligions: async (params?: ReligionQuery) => {
    const res = await religionApi.getReligions(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
