import { storeToRefs } from 'pinia'
import { academicYearService } from '../services/academicYearService'
import { useAcademicYearStore } from '../stores/academicYearStore'

export function useAcademicYearList() {
  const store = useAcademicYearStore()
  const { academicYears, totalItems, loading } = storeToRefs(store)

  return {
    academicYears,
    totalItems,
    loading,
    fetchAcademicYears: academicYearService.fetchAcademicYears,
    deleteAcademicYear: academicYearService.deleteAcademicYear,
    activateAcademicYear: academicYearService.activateAcademicYear,
    deactivateAcademicYear: academicYearService.deactivateAcademicYear,
  }
}
