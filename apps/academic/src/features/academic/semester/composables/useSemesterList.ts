import { storeToRefs } from 'pinia'
import { semesterService } from '../services/semesterService'
import { useSemesterStore } from '../stores/semesterStore'

export function useSemesterList() {
  const store = useSemesterStore()
  const { semesters, totalSemesters, loading, academicYears, semesterTypes } =
    storeToRefs(store)

  return {
    semesters,
    totalSemesters,
    loading,
    academicYears,
    semesterTypes,
    fetchSemesters: semesterService.fetchSemesters,
    fetchAcademicYears: semesterService.fetchAcademicYears,
    fetchSemesterTypes: semesterService.fetchSemesterTypes,
    deleteSemester: semesterService.deleteSemester,
    activateSemester: semesterService.activateSemester,
    deactivateSemester: semesterService.deactivateSemester,
  }
}
