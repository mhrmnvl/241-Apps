import { storeToRefs } from 'pinia'
import { studentScoreService } from '../services/studentScoreService'
import { useStudentScoreStore } from '../stores/studentScoreStore'

export function useStudentScore() {
  const store = useStudentScoreStore()
  const { assessmentItem, roster, loading, isSaving, formError } =
    storeToRefs(store)

  return {
    assessmentItem,
    roster,
    loading,
    isSaving,
    formError,
    fetchRoster: studentScoreService.fetchRoster,
    saveRoster: studentScoreService.saveRoster,
  }
}
