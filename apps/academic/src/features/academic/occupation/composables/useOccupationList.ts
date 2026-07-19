import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { occupationService } from '../services/occupationService'
import type { Occupation, OccupationQuery } from '../types'

export function useOccupationList() {
  const data = ref<Occupation[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const isAddOpen = ref(false)
  const isEditDialogOpen = ref(false)

  const selectedItem = ref<Occupation | null>(null)

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const totalRows = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')

  const sorting = ref<SortingState>([{ id: 'name', desc: false }])

  const fetchOccupations = async () => {
    isLoading.value = true
    isError.value = false
    try {
      const params: OccupationQuery = {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
      }
      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const result = await occupationService.fetchOccupations(params)
      data.value = result.data
      totalRows.value = result.meta.total
      totalPages.value = result.meta.totalPages ?? 0
    } catch {
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const deleteOccupation = async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    const success = await occupationService.deleteOccupation(id, callbacks)
    if (success) await fetchOccupations()
  }

  const openEditDialog = (item: Occupation) => {
    selectedItem.value = { ...item }
    isEditDialogOpen.value = true
  }

  watch(
    [pagination, sorting],
    () => {
      void fetchOccupations()
    },
    { deep: true },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.value.pageIndex = 0
      void fetchOccupations()
    }, 500)
  })

  return {
    data,
    isLoading,
    isError,
    fetchOccupations,
    deleteOccupation,
    pagination,
    totalRows,
    totalPages,
    searchQuery,
    sorting,
    isAddOpen,
    isEditDialogOpen,
    selectedItem,
    openEditDialog,
  }
}
