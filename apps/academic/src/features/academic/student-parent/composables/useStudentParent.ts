import { storeToRefs } from 'pinia'
import { useStudentParentStore } from '../stores/studentParentStore'
import { studentParentService } from '../services/studentParentService'

export function useStudentParent() {
  const store = useStudentParentStore()
  const { items, totalItems, loading, isSaving, formError, students, parents } =
    storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    students,
    parents,
    fetchAll: studentParentService.fetchAll,
    save: studentParentService.save,
    deleteStudentParent: studentParentService.deleteStudentParent,
    fetchStudents: studentParentService.fetchStudents,
    fetchParents: studentParentService.fetchParents,
    reset: store.reset,
  }
}
