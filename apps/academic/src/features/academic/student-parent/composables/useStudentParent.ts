import { storeToRefs } from 'pinia'
import { useStudentParentStore } from '../stores/studentParentStore'
import { studentParentService } from '../services/studentParentService'

export function useStudentParent() {
  const store = useStudentParentStore()
  const {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    students,
    parents,
  } = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await studentParentService.fetchAll()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await studentParentService.fetchAll()
  }

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
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
    setPage,
    setPageSize,
  }
}
