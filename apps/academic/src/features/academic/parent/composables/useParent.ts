import { storeToRefs } from 'pinia'
import { useParentStore } from '../stores/parentStore'
import { parentService } from '../services/parentService'

export function useParent() {
  const store = useParentStore()
  const {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    occupations,
    searchQuery,
    selectedOccupationId,
  } = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await parentService.fetchParents()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await parentService.fetchParents()
  }

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
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
    setPage,
    setPageSize,
  }
}
