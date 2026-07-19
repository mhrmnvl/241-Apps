import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserWithRoles, UserRoleQueryParams } from '../types'
import type { PaginationMeta } from '@/shared/types/api'

export const useUserRoleStore = defineStore('userRole', () => {
  const users = ref<UserWithRoles[]>([])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const paginationMeta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const currentFilters = ref<UserRoleQueryParams>({
    page: 1,
    limit: 10,
    roleCode: undefined,
  })

  return {
    users,
    isLoading,
    isUpdating,
    paginationMeta,
    currentFilters,
  }
})
