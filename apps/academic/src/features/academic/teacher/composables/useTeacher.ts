import { teacherService } from '../services/teacherService'
import { useTeacherStore } from '../stores/teacherStore'
import { storeToRefs } from 'pinia'

export function useTeacher() {
  const store = useTeacherStore()

  const {
    teachers,
    positions,
    positionCategories,
    totalTeachers,
    currentPage,
    pageSize,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
  } = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await teacherService.fetchTeachers()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await teacherService.fetchTeachers()
  }

  return {
    teachers,
    positions,
    positionCategories,
    totalTeachers,
    currentPage,
    pageSize,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
    fetchTeachers: teacherService.fetchTeachers,
    fetchPositions: teacherService.fetchPositions,
    fetchPositionCategories: teacherService.fetchPositionCategories,
    saveTeacher: teacherService.saveTeacher,
    savePosition: teacherService.savePosition,
    deletePosition: teacherService.deletePosition,
    getPositionsList: teacherService.getPositionsList,
    deleteTeacher: teacherService.deleteTeacher,
    toggleActive: teacherService.toggleActive,
    changePassword: teacherService.changePassword,
    setPage,
    setPageSize,
  }
}
