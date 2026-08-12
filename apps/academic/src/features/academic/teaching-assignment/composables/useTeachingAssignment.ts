import { storeToRefs } from 'pinia'
import { useTeachingAssignmentStore } from '../stores/teachingAssignmentStore'
import { teachingAssignmentService } from '../services/teachingAssignmentService'

export function useTeachingAssignment() {
  const store = useTeachingAssignmentStore()
  const {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    teachers,
    selectedClassroomId,
  } = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await teachingAssignmentService.fetchTeachingAssignments()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await teachingAssignmentService.fetchTeachingAssignments()
  }

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    teachers,
    selectedClassroomId,
    fetchFilterOptions: teachingAssignmentService.fetchFilterOptions,
    fetchTeachingAssignments:
      teachingAssignmentService.fetchTeachingAssignments,
    saveTeachingAssignment: teachingAssignmentService.saveTeachingAssignment,
    deleteTeachingAssignment:
      teachingAssignmentService.deleteTeachingAssignment,
    setPage,
    setPageSize,
  }
}
