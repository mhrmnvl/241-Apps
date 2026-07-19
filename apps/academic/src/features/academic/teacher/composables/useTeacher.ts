import { teacherService } from '../services/teacherService'
import { useTeacherStore } from '../stores/teacherStore'
import { storeToRefs } from 'pinia'

export function useTeacher() {
  const store = useTeacherStore()

  const {
    teachers,
    positions,
    totalTeachers,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
    filteredTeachers,
  } = storeToRefs(store)

  return {
    teachers,
    positions,
    totalTeachers,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
    filteredTeachers,
    fetchTeachers: teacherService.fetchTeachers,
    fetchPositions: teacherService.fetchPositions,
    saveTeacher: teacherService.saveTeacher,
    savePosition: teacherService.savePosition,
    deletePosition: teacherService.deletePosition,
    getPositionsList: teacherService.getPositionsList,
    deleteTeacher: teacherService.deleteTeacher,
    toggleActive: teacherService.toggleActive,
    changePassword: teacherService.changePassword,
  }
}
