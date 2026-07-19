import { storeToRefs } from 'pinia'
import { useAttendanceStore } from '../stores/attendanceStore'
import { attendanceService } from '../services/attendanceService'

export function useAttendance() {
  const store = useAttendanceStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    semesters,
    selectedClassroomId,
    selectedSemesterId,
    selectedDate,
    inputRows,
    recapItems,
    recapLoading,
    activeTab,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    semesters,
    selectedClassroomId,
    selectedSemesterId,
    selectedDate,
    inputRows,
    recapItems,
    recapLoading,
    activeTab,
    fetchFilterOptions: attendanceService.fetchFilterOptions,
    loadAttendanceInput: attendanceService.loadAttendanceInput,
    bulkSaveAttendance: attendanceService.bulkSaveAttendance,
    fetchRecap: attendanceService.fetchRecap,
  }
}
