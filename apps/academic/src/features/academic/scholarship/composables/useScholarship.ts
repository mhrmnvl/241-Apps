import { storeToRefs } from 'pinia'
import { useScholarshipStore } from '../stores/scholarshipStore'
import { scholarshipService } from '../services/scholarshipService'

export function useScholarship() {
  const store = useScholarshipStore()

  const { isSaving } = storeToRefs(store)

  return {
    isSaving,
    saveScholarship: scholarshipService.saveScholarship,
    deleteScholarship: scholarshipService.deleteScholarship,
  }
}
