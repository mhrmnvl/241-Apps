import { storeToRefs } from 'pinia'
import { gradeService } from '../services/gradeService'
import { useGradeStore } from '../stores/gradeStore'

export function useGradeList() {
  const store = useGradeStore()
  const { items, totalItems, loading } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    fetchGrades: gradeService.fetchGrades,
    deleteGrade: gradeService.deleteGrade,
  }
}
