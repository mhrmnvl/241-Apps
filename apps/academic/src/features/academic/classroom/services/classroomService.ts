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
