import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  StudentScoreRosterItem,
  StudentScoreRosterAssessmentItem,
} from '../types'

export const useStudentScoreStore = defineStore('studentScore', () => {
  const assessmentItem = ref<StudentScoreRosterAssessmentItem | null>(null)
  const roster = ref<StudentScoreRosterItem[]>([])
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return {
    assessmentItem,
    roster,
    loading,
    isSaving,
    formError,
  }
})
