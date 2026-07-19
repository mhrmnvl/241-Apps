import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { employmentTypeApi } from '../api/employmentTypeApi'
import type {
  EmploymentTypeCreatePayload,
  EmploymentTypeUpdatePayload,
  EmploymentTypeQuery,
} from '../types'

export const employmentTypeService = {
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

  fetchEmploymentTypes: async (params?: EmploymentTypeQuery) => {
    const res = await employmentTypeApi.getEmploymentTypes(params)
    const envelope = res.data
    return {
      data: envelope?.data ?? [],
      meta: envelope?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },
}
