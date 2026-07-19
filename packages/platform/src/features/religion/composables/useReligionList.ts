import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { religionService } from '../services/religionService'
import type { Religion, ReligionQuery } from '../types'

export function useReligionList() {
  const data = ref<Religion[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const isAddOpen = ref(false)
  const isEditDialogOpen = ref(false)

  const selectedItem = ref<Religion | null>(null)

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const totalRows = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')

  const sorting = ref<SortingState>([{ id: 'name', desc: false }])

  const fetchReligions = async () => {
    isLoading.value = true
    isError.value = false
    try {
      const params: ReligionQuery = {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
      }
      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const result = await religionService.fetchReligions(params)
      data.value = result.data
      totalRows.value = result.meta.total
      totalPages.value = result.meta.totalPages ?? 0
    } catch {
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const deleteReligion = async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    const success = await religionService.deleteReligion(id, callbacks)
    if (success) await fetchReligions()
  }

  const openEditDialog = (item: Religion) => {
    selectedItem.value = { ...item }
    isEditDialogOpen.value = true
  }

  watch(
    [pagination, sorting],
    () => {
      void fetchReligions()
    },
    { deep: true },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.value.pageIndex = 0
      void fetchReligions()
    }, 500)
  })

  return {
    data,
    isLoading,
    isError,
    fetchReligions,
    deleteReligion,
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
