import { storeToRefs } from 'pinia'
import { useTeachingAssignmentStore } from '../stores/teachingAssignmentStore'
import { teachingAssignmentService } from '../services/teachingAssignmentService'

export function useTeachingAssignment() {
  const store = useTeachingAssignmentStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    semesters,
    teachers,
    selectedSemesterId,
    selectedClassroomId,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    semesters,
    teachers,
    selectedSemesterId,
    selectedClassroomId,
    fetchFilterOptions: teachingAssignmentService.fetchFilterOptions,
    fetchTeachingAssignments:
      teachingAssignmentService.fetchTeachingAssignments,
    saveTeachingAssignment: teachingAssignmentService.saveTeachingAssignment,
    deleteTeachingAssignment:
      teachingAssignmentService.deleteTeachingAssignment,
  }
}
