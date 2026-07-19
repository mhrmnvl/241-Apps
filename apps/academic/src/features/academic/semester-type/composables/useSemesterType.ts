import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { semesterTypeService } from '../services/semesterTypeService'
import type { SemesterType, SemesterTypeQuery } from '../types'

export function useSemesterType() {
  const data = ref<SemesterType[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const isAddOpen = ref(false)
  const isEditDialogOpen = ref(false)

  const selectedItem = ref<SemesterType | null>(null)

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const totalRows = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')

  const sorting = ref<SortingState>([{ id: 'name', desc: false }])

  const fetchSemesterTypes = async () => {
    isLoading.value = true
    isError.value = false
    try {
      const params: SemesterTypeQuery = {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
      }
      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const result = await semesterTypeService.fetchSemesterTypes(params)
      data.value = result.data
      totalRows.value = result.meta.total
      totalPages.value = result.meta.totalPages ?? 0
    } catch {
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const deleteSemesterType = async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    const success = await semesterTypeService.deleteSemesterType(id, callbacks)
    if (success) await fetchSemesterTypes()
  }

  const openEditDialog = (item: SemesterType) => {
    selectedItem.value = { ...item }
    isEditDialogOpen.value = true
  }

  watch(
    [pagination, sorting],
    () => {
      void fetchSemesterTypes()
    },
    { deep: true },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.value.pageIndex = 0
      void fetchSemesterTypes()
    }, 500)
  })

  return {
    data,
    isLoading,
    isError,
    fetchSemesterTypes,
    deleteSemesterType,
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

export function useSemesterTypeForm() {
  const isSubmitting = ref(false)

  const createSemesterType = async (payload: {
    name: string
    isActive: boolean
  }) => {
    isSubmitting.value = true
    try {
      return await semesterTypeService.createSemesterType(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateSemesterType = async (
    id: string,
    payload: { name: string; isActive: boolean },
  ) => {
    isSubmitting.value = true
    try {
      return await semesterTypeService.updateSemesterType(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createSemesterType,
    updateSemesterType,
  }
}
