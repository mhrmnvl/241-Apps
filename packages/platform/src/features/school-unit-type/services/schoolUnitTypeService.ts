import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { schoolUnitTypeApi } from '../api/schoolUnitTypeApi'
import type {
  SchoolUnitType,
  SchoolUnitTypeCreatePayload,
  SchoolUnitTypeUpdatePayload,
} from '../types'

export const schoolUnitTypeService = {
  getSchoolUnitTypes: async (): Promise<SchoolUnitType[]> => {
    try {
      const res = await schoolUnitTypeApi.getSchoolUnitTypes({ limit: 100 })
      return res.data.data
    } catch {
      return []
    }
  },

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
}
