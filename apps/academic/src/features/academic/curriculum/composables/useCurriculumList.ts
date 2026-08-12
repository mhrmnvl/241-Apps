import { storeToRefs } from 'pinia'
import { curriculumService } from '../services/curriculumService'
import { useCurriculumStore } from '../stores/curriculumStore'

export function useCurriculumList() {
  const store = useCurriculumStore()
  const { curricula, totalCurricula, loading, academicYears } =
    storeToRefs(store)

  return {
    curricula,
    totalCurricula,
    loading,
    academicYears,
    fetchCurricula: curriculumService.fetchCurricula,
    fetchAcademicYears: curriculumService.fetchAcademicYears,
    deleteCurriculum: curriculumService.deleteCurriculum,
  }
}
