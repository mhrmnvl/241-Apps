import type {
  Classroom,
  ClassroomSavePayload,
  ClassroomQueryParams,
} from '../types'
import { classroomApi } from '../api/classroomApi'
import { useClassroomStore } from '../stores/classroomStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { useReferenceList } from '@/features/platform/reference-data'

export const classroomService = {
  /**
   * Gives a new academic year the classrooms the old one had.
   *
   * Not a store operation: nothing on the promotion screen holds a classroom
   * list, and the thing that changes afterwards is what the server recommends.
   * So this reports and returns, and the caller refetches.
   */
  copyClassroomsToAcademicYear: async (
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ) => {
    try {
      const res = await classroomApi.copyClassroomsToAcademicYear({
        sourceAcademicYearId,
        targetAcademicYearId,
      })
      const result = res.data.data
      const created = result?.created ?? 0
      const skipped = result?.skipped ?? 0

      toast.success(
        skipped > 0
          ? `${created} kelas disalin, ${skipped} sudah ada sebelumnya.`
          : `${created} kelas disalin.`,
      )
      return { success: true, result }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(error, 'Gagal menyalin kelas.')
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  fetchClassrooms: async (params?: ClassroomQueryParams) => {
    const store = useClassroomStore()
    store.loading = true
    try {
      const mergedParams = {
        page: params?.page ?? store.currentFilters.page,
        limit: params?.limit ?? store.currentFilters.limit,
        search: params?.search ?? store.currentFilters.search,
        // Omitted means "the active year" on the backend, so an unset filter
        // still scopes the list instead of spanning every academic year.
        academicYearId:
          params?.academicYearId ?? store.currentFilters.academicYearId,
      }
      store.currentFilters = mergedParams

      const res = await classroomApi.getClassrooms(mergedParams)
      const classrooms: Classroom[] = res.data.data ?? []

      // The backend already scoped this to the current semester, and the
      // database allows only one row per classroom per semester, so this is a
      // rename rather than a choice. It used to be a choice: every assignment
      // ever made was fetched and a winner picked here, which broke quietly
      // once a classroom had no row for the current semester.
      store.classrooms = classrooms.map((classroom) => ({
        ...classroom,
        supervisor:
          classroom.classroomSupervisors?.[0]?.teacher ?? classroom.supervisor,
      }))
      store.totalClassrooms = res.data.meta?.total ?? classrooms.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data kelas.'))
    } finally {
      store.loading = false
    }
  },

  fetchClassroomDetail: async (classroomId: string) => {
    const store = useClassroomStore()
    store.manageLoading = true
    try {
      const res = await classroomApi.getClassroomById(classroomId)
      store.currentClassroom = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat detail kelas.'),
      )
    } finally {
      store.manageLoading = false
    }
  },

  saveClassroom: async (id: string | null, payload: ClassroomSavePayload) => {
    const store = useClassroomStore()
    store.isSaving = true
    store.formError = null

    try {
      if (id) {
        await classroomApi.updateClassroom(id, payload)
      } else {
        await classroomApi.createClassroom(payload)
      }
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('classrooms')
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan kelas.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteClassroom: async (id: string) => {
    try {
      await classroomApi.deleteClassroom(id)
      toast.success('Kelas berhasil dihapus.')
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('classrooms')
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus kelas.'))
      return { success: false }
    }
  },
}
