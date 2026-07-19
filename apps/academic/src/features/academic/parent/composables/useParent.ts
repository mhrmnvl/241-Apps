import { storeToRefs } from 'pinia'
import { useParentStore } from '../stores/parentStore'
import { parentService } from '../services/parentService'

export function useParent() {
  const store = useParentStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    occupations,
    searchQuery,
    selectedOccupationId,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    occupations,
    searchQuery,
    selectedOccupationId,
    fetchFilterOptions: parentService.fetchFilterOptions,
    fetchParents: parentService.fetchParents,
    saveParent: parentService.saveParent,
    deleteParent: parentService.deleteParent,
  }
}
