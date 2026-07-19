import { storeToRefs } from 'pinia'
import { curriculaService } from '../services/curriculaService'
import { useCurriculaStore } from '../stores/curriculaStore'

export function useCurriculaList() {
  const store = useCurriculaStore()
  const { curricula, totalCurricula, loading, academicYears } =
    storeToRefs(store)

  return {
    curricula,
    totalCurricula,
    loading,
    academicYears,
    fetchCurricula: curriculaService.fetchCurricula,
    fetchAcademicYears: curriculaService.fetchAcademicYears,
    deleteCurriculum: curriculaService.deleteCurriculum,
  }
}
