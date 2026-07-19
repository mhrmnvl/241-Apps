import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { schoolUnitTypeService } from '../services/schoolUnitTypeService'
import type { SchoolUnitType, SchoolUnitTypeQuery } from '../types'

export function useSchoolUnitTypeList() {
  const data = ref<SchoolUnitType[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const isAddOpen = ref(false)
  const isEditDialogOpen = ref(false)

  const selectedItem = ref<SchoolUnitType | null>(null)

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const totalRows = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')

  const sorting = ref<SortingState>([{ id: 'name', desc: false }])

  const fetchSchoolUnitTypes = async () => {
    isLoading.value = true
    isError.value = false
    try {
      const params: SchoolUnitTypeQuery = {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
      }
      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const result = await schoolUnitTypeService.fetchSchoolUnitTypes(params)
      data.value = result.data
      totalRows.value = result.meta.total
      totalPages.value = result.meta.totalPages ?? 0
    } catch {
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const deleteSchoolUnitType = async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    const success = await schoolUnitTypeService.deleteSchoolUnitType(
      id,
      callbacks,
    )
    if (success) await fetchSchoolUnitTypes()
  }

  const openEditDialog = (item: SchoolUnitType) => {
    selectedItem.value = { ...item }
    isEditDialogOpen.value = true
  }

  watch(
    [pagination, sorting],
    () => {
      void fetchSchoolUnitTypes()
    },
    { deep: true },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.value.pageIndex = 0
      void fetchSchoolUnitTypes()
    }, 500)
  })

  return {
    data,
    isLoading,
    isError,
    fetchSchoolUnitTypes,
    deleteSchoolUnitType,
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
