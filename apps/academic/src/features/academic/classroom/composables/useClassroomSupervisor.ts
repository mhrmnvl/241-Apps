import { storeToRefs } from 'pinia'
import { classroomReferenceService } from '../services/classroomReferenceService'
import { classroomSupervisorService } from '../services/classroomSupervisorService'
import { useClassroomStore } from '../stores/classroomStore'

export function useClassroomSupervisor() {
  const store = useClassroomStore()
  const {
    teachers,
    isSupervisorSaving,
    supervisorFormError,
    classroomSupervisorAssignments,
  } = storeToRefs(store)

  return {
    teachers,
    isSupervisorSaving,
    supervisorFormError,
    classroomSupervisorAssignments,
    fetchTeachers: classroomReferenceService.fetchTeachers,
    fetchClassroomSupervisors:
      classroomSupervisorService.fetchClassroomSupervisors,
    saveClassroomSupervisor: classroomSupervisorService.saveClassroomSupervisor,
    deleteClassroomSupervisor:
      classroomSupervisorService.deleteClassroomSupervisor,
  }
}
