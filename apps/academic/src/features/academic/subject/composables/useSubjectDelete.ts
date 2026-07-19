import { subjectService } from '../services/subjectService'

export function useSubjectDelete() {
  return {
    deleteSubject: subjectService.deleteSubject,
  }
}
