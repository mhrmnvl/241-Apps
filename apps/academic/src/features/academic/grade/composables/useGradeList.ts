import { storeToRefs } from 'pinia'
import { gradeService } from '../services/gradeService'
import { useGradeStore } from '../stores/gradeStore'

export function useGradeList() {
  const store = useGradeStore()
  const { items, totalItems, loading, currentFilters } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    currentFilters,
    fetchGrades: gradeService.fetchGrades,
    deleteGrade: gradeService.deleteGrade,
  }
}
