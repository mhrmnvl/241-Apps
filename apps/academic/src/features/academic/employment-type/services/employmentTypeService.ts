import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { employmentTypeApi } from '../api/employmentTypeApi'
import type {
  EmploymentType,
  EmploymentTypeCreatePayload,
  EmploymentTypeUpdatePayload,
} from '../types'

export const employmentTypeService = {
  getEmploymentTypes: async (): Promise<EmploymentType[]> => {
    try {
      const res = await employmentTypeApi.getEmploymentTypes({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      return res.data.data
    } catch {
      return []
    }
  },

  createEmploymentType: async (payload: EmploymentTypeCreatePayload) => {
    try {
      await employmentTypeApi.createEmploymentType(payload)
      toast.success('Status kepegawaian berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal menambahkan status kepegawaian',
        ),
      )
      return false
    }
  },

  updateEmploymentType: async (
    id: string,
    payload: EmploymentTypeUpdatePayload,
  ) => {
    try {
      await employmentTypeApi.updateEmploymentType(id, payload)
      toast.success('Status kepegawaian berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal memperbarui status kepegawaian',
        ),
      )
      return false
    }
  },

  deleteEmploymentType: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await employmentTypeApi.deleteEmploymentType(id)
      toast.success('Berhasil menghapus status kepegawaian')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus status kepegawaian'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },
}
