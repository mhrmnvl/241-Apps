import type {
  ClassroomStructureSavePayload,
  ClassroomSupervisorSavePayload,
} from '../types'
import { classroomApi } from '../api/classroomApi'
import { useClassroomStore } from '../stores/classroomStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { classroomSupervisorService } from './classroomSupervisorService'

export const classroomStructureService = {
  fetchClassroomStructure: async (classroomId: string, semesterId: string) => {
    const store = useClassroomStore()
    try {
      const res = await classroomApi.getClassroomStructures({
        classroomId,
        semesterId,
        limit: 1,
      })
      const structures = res.data.data ?? []
      store.classroomStructure = structures[0] ?? null
      return store.classroomStructure
    } catch {
      store.classroomStructure = null
      return null
    }
  },

  saveClassroomStructure: async (
    existingId: string | null,
    payload: ClassroomStructureSavePayload,
  ): Promise<{ success: boolean }> => {
    const store = useClassroomStore()
    store.isSaving = true
    try {
      if (existingId) {
        await classroomApi.updateClassroomStructure(existingId, payload)
      } else {
        await classroomApi.createClassroomStructure(payload)
      }
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan struktur kelas.'),
      )
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  saveClassroomStructureWithSupervisor: async (
    existingStructureId: string | null,
    structurePayload: ClassroomStructureSavePayload,
    existingSupervisorAssignmentId: string | null,
    supervisorPayload: ClassroomSupervisorSavePayload,
  ): Promise<{ success: boolean }> => {
    try {
      const supResult =
        await classroomSupervisorService.saveClassroomSupervisor(
          existingSupervisorAssignmentId,
          supervisorPayload,
        )

      const structResult =
        await classroomStructureService.saveClassroomStructure(
          existingStructureId,
          structurePayload,
        )

      if (supResult.success && structResult.success) {
        toast.success('Struktur kelas berhasil disimpan.')
        return { success: true }
      }
      return { success: false }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan struktur kelas.'),
      )
      return { success: false }
    }
  },

  deleteClassroomStructure: async (
    id: string,
  ): Promise<{ success: boolean }> => {
    const store = useClassroomStore()
    store.isSaving = true
    try {
      await classroomApi.deleteClassroomStructure(id)
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus struktur kelas.'),
      )
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },
}
