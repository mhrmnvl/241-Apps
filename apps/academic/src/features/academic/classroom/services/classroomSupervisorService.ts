import type { ClassroomSupervisorSavePayload } from '../types'
import { classroomApi } from '../api/classroomApi'
import { useClassroomStore } from '../stores/classroomStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

export const classroomSupervisorService = {
  saveClassroomSupervisor: async (
    id: string | null,
    payload: ClassroomSupervisorSavePayload,
  ) => {
    const store = useClassroomStore()
    store.isSupervisorSaving = true
    store.supervisorFormError = null

    try {
      if (id) {
        await classroomApi.updateClassroomSupervisor(id, payload)
      } else {
        await classroomApi.createClassroomSupervisor(payload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.supervisorFormError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan wali kelas.',
      )
      return { success: false, error: store.supervisorFormError }
    } finally {
      store.isSupervisorSaving = false
    }
  },

  deleteClassroomSupervisor: async (id: string) => {
    const store = useClassroomStore()
    store.isSupervisorSaving = true
    store.supervisorFormError = null

    try {
      await classroomApi.deleteClassroomSupervisor(id)
      return { success: true }
    } catch (error: unknown) {
      store.supervisorFormError = getIndonesianErrorMessage(
        error,
        'Gagal menghapus wali kelas.',
      )
      return { success: false, error: store.supervisorFormError }
    } finally {
      store.isSupervisorSaving = false
    }
  },

  fetchClassroomSupervisors: async (classroomId: string) => {
    const store = useClassroomStore()
    try {
      const res = await classroomApi.getClassroomSupervisors({
        classroomId,
        limit: 100,
      })
      store.classroomSupervisorAssignments = res.data.data ?? []
    } catch (error: unknown) {
      void error
    }
  },
}
