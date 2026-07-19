import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { schoolUnitTypeApi } from '../api/schoolUnitTypeApi'
import type {
  SchoolUnitTypeCreatePayload,
  SchoolUnitTypeUpdatePayload,
  SchoolUnitTypeQuery,
} from '../types'

export const schoolUnitTypeService = {
  createSchoolUnitType: async (payload: SchoolUnitTypeCreatePayload) => {
    try {
      await schoolUnitTypeApi.createSchoolUnitType(payload)
      toast.success('Tipe sekolah berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan tipe sekolah'),
      )
      return false
    }
  },

  updateSchoolUnitType: async (
    id: string,
    payload: SchoolUnitTypeUpdatePayload,
  ) => {
    try {
      await schoolUnitTypeApi.updateSchoolUnitType(id, payload)
      toast.success('Tipe sekolah berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui tipe sekolah'),
      )
      return false
    }
  },

  deleteSchoolUnitType: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await schoolUnitTypeApi.deleteSchoolUnitType(id)
      toast.success('Berhasil menghapus tipe sekolah')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus tipe sekolah'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },

  fetchSchoolUnitTypes: async (params?: SchoolUnitTypeQuery) => {
    const res = await schoolUnitTypeApi.getSchoolUnitTypes(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
