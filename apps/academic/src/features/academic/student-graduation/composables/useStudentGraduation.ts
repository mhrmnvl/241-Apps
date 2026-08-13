import { storeToRefs } from 'pinia'
import { useStudentGraduationStore } from '../stores/studentGraduationStore'
import { studentGraduationService } from '../services/studentGraduationService'

export function useStudentGraduation() {
  const store = useStudentGraduationStore()
  const {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    students,
    academicYears,
    selectedAcademicYearId,
    candidates,
    graduationTerm,
    finalGradeName,
    isLoadingCandidates,
    isGraduating,
  } = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await studentGraduationService.fetchStudentGraduations()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await studentGraduationService.fetchStudentGraduations()
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
    academicYears,
    selectedAcademicYearId,
    candidates,
    graduationTerm,
    finalGradeName,
    isLoadingCandidates,
    isGraduating,
    fetchReferenceData: studentGraduationService.fetchReferenceData,
    fetchStudentGraduations: studentGraduationService.fetchStudentGraduations,
    saveStudentGraduation: studentGraduationService.saveStudentGraduation,
    deleteStudentGraduation: studentGraduationService.deleteStudentGraduation,
    fetchCandidates: studentGraduationService.fetchCandidates,
    bulkGraduate: studentGraduationService.bulkGraduate,
    setPage,
    setPageSize,
  }
}
