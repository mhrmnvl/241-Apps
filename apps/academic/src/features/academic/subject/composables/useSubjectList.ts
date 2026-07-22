import { storeToRefs } from 'pinia'
import { useSubjectStore } from '../stores/subjectStore'
import { subjectService } from '../services/subjectService'

export function useSubjectList() {
  const store = useSubjectStore()
  const { subjects, totalSubjects, loading, currentFilters } =
    storeToRefs(store)

  return {
    subjects,
    totalSubjects,
    loading,
    currentFilters,
    fetchSubjects: subjectService.fetchSubjects,
  }
}
