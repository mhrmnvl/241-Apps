import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { positionCategoryService } from '../services/positionCategoryService'
import type { PositionCategory, PositionCategoryQuery } from '../types'

export function usePositionCategoryList() {
  const data = ref<PositionCategory[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const isAddOpen = ref(false)
  const isEditDialogOpen = ref(false)

  const selectedItem = ref<PositionCategory | null>(null)

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const totalRows = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')

  const sorting = ref<SortingState>([{ id: 'name', desc: false }])

  const fetchPositionCategories = async () => {
    isLoading.value = true
    isError.value = false
    try {
      const params: PositionCategoryQuery = {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
      }
      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const result =
        await positionCategoryService.fetchPositionCategories(params)
      data.value = result.data
      totalRows.value = result.meta.total
      totalPages.value = result.meta.totalPages ?? 0
    } catch {
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const deletePositionCategory = async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    const success = await positionCategoryService.deletePositionCategory(
      id,
      callbacks,
    )
    if (success) await fetchPositionCategories()
  }

  const openEditDialog = (item: PositionCategory) => {
    selectedItem.value = { ...item }
    isEditDialogOpen.value = true
  }

  watch(
    [pagination, sorting],
    () => {
      void fetchPositionCategories()
    },
    { deep: true },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.value.pageIndex = 0
      void fetchPositionCategories()
    }, 500)
  })

  return {
    data,
    isLoading,
    isError,
    fetchPositionCategories,
    deletePositionCategory,
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
