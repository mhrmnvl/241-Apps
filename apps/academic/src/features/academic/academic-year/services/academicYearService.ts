import { academicYearApi } from '../api/academicYearApi'
import { useAcademicYearStore } from '../stores/academicYearStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import type { AcademicYearSavePayload } from '../types'
import { useReferenceList } from '@/features/platform/reference-data'

export const academicYearService = {
  fetchAcademicYears: async () => {
    const store = useAcademicYearStore()
    store.loading = true
    try {
      const res = await academicYearApi.getAcademicYears({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.academicYears = res.data.data
      store.totalItems = res.data.meta?.total ?? res.data.data.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tahun ajaran.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveAcademicYear: async (
    id: string | null,
    payload: AcademicYearSavePayload,
    originalIsActive?: boolean,
  ) => {
    const store = useAcademicYearStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        // Named field by field rather than forwarded whole. `isActive` is not
        // part of `UpdateAcademicYearDto` — activation is a separate endpoint,
        // called just below — and the API validates with `forbidNonWhitelisted`,
        // so passing it along failed the entire edit with "property isActive
        // should not exist" while the name change never reached the server.
        await academicYearApi.updateAcademicYear(id, { name: payload.name })
        if (
          payload.isActive !== undefined &&
          payload.isActive !== originalIsActive
        ) {
          if (payload.isActive) {
            await academicYearApi.activateAcademicYear(id)
          } else {
            await academicYearApi.deactivateAcademicYear(id)
          }
        }
      } else {
        await academicYearApi.createAcademicYear(payload)
      }
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('academicYears')
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan tahun ajaran.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteAcademicYear: async (id: string) => {
    try {
      await academicYearApi.deleteAcademicYear(id)
      toast.success('Tahun ajaran berhasil dihapus.')
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('academicYears')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal menghapus tahun ajaran.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  activateAcademicYear: async (id: string) => {
    try {
      await academicYearApi.activateAcademicYear(id)
      toast.success('Tahun ajaran berhasil diaktifkan.')
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('academicYears')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal mengaktifkan tahun ajaran.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  deactivateAcademicYear: async (id: string) => {
    try {
      await academicYearApi.deactivateAcademicYear(id)
      toast.success('Tahun ajaran berhasil dinonaktifkan.')
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('academicYears')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal menonaktifkan tahun ajaran.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },
}
