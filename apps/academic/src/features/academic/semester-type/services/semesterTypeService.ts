import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { semesterTypeApi } from '../api/semesterTypeApi'
import type {
  SemesterType,
  SemesterTypeCreatePayload,
  SemesterTypeQuery,
  SemesterTypeUpdatePayload,
} from '../types'

export const semesterTypeService = {
  getSemesterTypes: async (): Promise<SemesterType[]> => {
    try {
      const res = await semesterTypeApi.getSemesterTypes({ limit: 100 })
      return res.data.data
    } catch {
      return []
    }
  },

  createSemesterType: async (payload: SemesterTypeCreatePayload) => {
    try {
      await semesterTypeApi.createSemesterType(payload)
      toast.success('Tipe semester berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan tipe semester'),
      )
      return false
    }
  },

  updateSemesterType: async (
    id: string,
    payload: SemesterTypeUpdatePayload,
  ) => {
    try {
      await semesterTypeApi.updateSemesterType(id, payload)
      toast.success('Tipe semester berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui tipe semester'),
      )
      return false
    }
  },

  deleteSemesterType: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await semesterTypeApi.deleteSemesterType(id)
      toast.success('Berhasil menghapus tipe semester')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus tipe semester'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },

  fetchSemesterTypes: async (params?: SemesterTypeQuery) => {
    const res = await semesterTypeApi.getSemesterTypes(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
