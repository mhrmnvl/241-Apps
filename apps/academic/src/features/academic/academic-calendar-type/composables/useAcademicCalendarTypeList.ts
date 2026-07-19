import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { ref, watch } from 'vue'
import { academicCalendarTypeService } from '../services/academicCalendarTypeService'
import type { AcademicCalendarType, AcademicCalendarTypeQuery } from '../types'

export function useAcademicCalendarTypeList() {
  const data = ref<AcademicCalendarType[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const isAddOpen = ref(false)
  const isEditDialogOpen = ref(false)

  const selectedItem = ref<AcademicCalendarType | null>(null)

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const totalRows = ref(0)
  const totalPages = ref(0)
  const searchQuery = ref('')

  const sorting = ref<SortingState>([{ id: 'name', desc: false }])

  const fetchAcademicCalendarTypes = async () => {
    isLoading.value = true
    isError.value = false
    try {
      const params: AcademicCalendarTypeQuery = {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
      }
      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const result =
        await academicCalendarTypeService.fetchAcademicCalendarTypes(params)
      data.value = result.data
      totalRows.value = result.meta.total
      totalPages.value = result.meta.totalPages ?? 0
    } catch {
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const deleteAcademicCalendarType = async (
    id: string,
    callbacks?: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => {
    const success =
      await academicCalendarTypeService.deleteAcademicCalendarType(
        id,
        callbacks,
      )
    if (success) await fetchAcademicCalendarTypes()
  }

  const openEditDialog = (item: AcademicCalendarType) => {
    selectedItem.value = { ...item }
    isEditDialogOpen.value = true
  }

  watch(
    [pagination, sorting],
    () => {
      void fetchAcademicCalendarTypes()
    },
    { deep: true },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.value.pageIndex = 0
      void fetchAcademicCalendarTypes()
    }, 500)
  })

  return {
    data,
    isLoading,
    isError,
    fetchAcademicCalendarTypes,
    deleteAcademicCalendarType,
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
