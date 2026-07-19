import { storeToRefs } from 'pinia'
import { usePositionStore } from '../stores/positionStore'
import { positionService } from '../services/positionService'
import { ref } from 'vue'

export function usePosition() {
  const store = usePositionStore()
  const { items, totalItems, loading, isSaving, formError } = storeToRefs(store)

  const searchQuery = ref('')
  const selectedCategory = ref<string>('')

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    searchQuery,
    selectedCategory,
    fetchPositions: positionService.fetchPositions,
    savePosition: positionService.savePosition,
    deletePosition: positionService.deletePosition,
  }
}
