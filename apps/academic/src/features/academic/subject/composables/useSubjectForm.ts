import { storeToRefs } from 'pinia'
import { useSubjectStore } from '../stores/subjectStore'
import { subjectService } from '../services/subjectService'

export function useSubjectForm() {
  const store = useSubjectStore()
  const { isSaving, formError } = storeToRefs(store)

  return {
    isSaving,
    formError,
    saveSubject: subjectService.saveSubject,
  }
}
