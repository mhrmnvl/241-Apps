import { storeToRefs } from 'pinia'
import { classroomStructureService } from '../services/classroomStructureService'
import { useClassroomStore } from '../stores/classroomStore'

export function useClassroomStructure() {
  const store = useClassroomStore()
  const { classroomStructure, isSaving } = storeToRefs(store)

  return {
    classroomStructure,
    isSaving,
    fetchClassroomStructure: classroomStructureService.fetchClassroomStructure,
    saveClassroomStructure: classroomStructureService.saveClassroomStructure,
    saveClassroomStructureWithSupervisor:
      classroomStructureService.saveClassroomStructureWithSupervisor,
    deleteClassroomStructure:
      classroomStructureService.deleteClassroomStructure,
  }
}
