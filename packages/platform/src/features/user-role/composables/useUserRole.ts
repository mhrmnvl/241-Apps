import { storeToRefs } from 'pinia'
import { userRoleService } from '../services/userRoleService'
import { useUserRoleStore } from '../stores/userRoleStore'

export function useUserRole() {
  const store = useUserRoleStore()
  const { users, isLoading, isUpdating, paginationMeta, currentFilters } =
    storeToRefs(store)

  return {
    users,
    isLoading,
    isUpdating,
    paginationMeta,
    currentFilters,
    fetchTableData: userRoleService.fetchTableData,
    handleUpdateFilters: userRoleService.handleUpdateFilters,
    toggleAdmin: userRoleService.toggleAdmin,
  }
}
