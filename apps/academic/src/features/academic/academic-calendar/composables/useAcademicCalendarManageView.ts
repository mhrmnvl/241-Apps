import { ref } from 'vue'
import { useAcademicCalendar } from './useAcademicCalendar'
import type { FilterPayload } from '../types'

export function useAcademicCalendarManageView() {
  const {
    tableEvents,
    tableLoading,
    isDeletingBulk,
    fetchTableEvents,
    handleUpdateFilters,
    deleteBulk,
  } = useAcademicCalendar()

  const tableViewRef = ref<{ clearSelection: () => void } | null>(null)

  async function handleDeleteBulk(ids: string[]) {
    const success = await deleteBulk(ids)
    if (success) {
      if (tableViewRef.value) {
        tableViewRef.value.clearSelection()
      }
      void fetchTableEvents()
    }
  }

  function onUpdateFilters(payload: FilterPayload) {
    handleUpdateFilters(payload)
  }

  function handleSavedOrDeleted() {
    void fetchTableEvents()
  }

  return {
    tableEvents,
    tableLoading,
    isDeletingBulk,
    fetchTableEvents,
    onUpdateFilters,
    tableViewRef,
    handleDeleteBulk,
    handleSavedOrDeleted,
  }
}
