import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { academicCalendarTypeApi } from '../api/academicCalendarTypeApi'
import type {
  AcademicCalendarType,
  AcademicCalendarTypeCreatePayload,
  AcademicCalendarTypeUpdatePayload,
} from '../types'

export const academicCalendarTypeService = {
  getAcademicCalendarTypes: async (): Promise<AcademicCalendarType[]> => {
    try {
      const res = await academicCalendarTypeApi.getAcademicCalendarTypes({
        limit: 100,
      })
      return res.data.data
    } catch {
      return []
    }
  },

  createAcademicCalendarType: async (
    payload: AcademicCalendarTypeCreatePayload,
  ) => {
    try {
      await academicCalendarTypeApi.createAcademicCalendarType(payload)
      toast.success('Tipe Kalender berhasil ditambahkan')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menambahkan tipe kalender'),
      )
      return false
    }
  },

  updateAcademicCalendarType: async (
    id: string,
    payload: AcademicCalendarTypeUpdatePayload,
  ) => {
    try {
      await academicCalendarTypeApi.updateAcademicCalendarType(id, payload)
      toast.success('Tipe Kalender berhasil diperbarui')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui tipe kalender'),
      )
      return false
    }
  },

  deleteAcademicCalendarType: async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    if (callbacks) callbacks.setLoading(true)
    try {
      await academicCalendarTypeApi.deleteAcademicCalendarType(id)
      toast.success('Berhasil menghapus tipe kalender')
      if (callbacks) callbacks.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus tipe kalender'),
      )
      return false
    } finally {
      if (callbacks) callbacks.setLoading(false)
    }
  },
}
