import { storeToRefs } from 'pinia'
import { useStudentGraduationStore } from '../stores/studentGraduationStore'
import { studentGraduationService } from '../services/studentGraduationService'

export function useStudentGraduation() {
  const store = useStudentGraduationStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    students,
    academicYears,
    selectedAcademicYearId,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    students,
    academicYears,
    selectedAcademicYearId,
    fetchReferenceData: studentGraduationService.fetchReferenceData,
    fetchStudentGraduations: studentGraduationService.fetchStudentGraduations,
    saveStudentGraduation: studentGraduationService.saveStudentGraduation,
    deleteStudentGraduation: studentGraduationService.deleteStudentGraduation,
  }
}
