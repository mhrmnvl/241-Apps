import { storeToRefs } from 'pinia'
import { semesterService } from '../services/semesterService'
import { useSemesterStore } from '../stores/semesterStore'

export function useSemesterRollover() {
  const store = useSemesterStore()
  const { isRollingOver, rolloverSummary } = storeToRefs(store)

  return {
    isRollingOver,
    rolloverSummary,
    rolloverSemester: semesterService.rolloverSemester,
  }
}
