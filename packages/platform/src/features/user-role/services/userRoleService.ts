import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { userRoleApi } from '../api/userRoleApi'
import { useUserRoleStore } from '../stores/userRoleStore'
import type { UserRoleQueryParams } from '../types'

export const userRoleService = {
  fetchTableData: async (params?: UserRoleQueryParams) => {
    const store = useUserRoleStore()
    store.isLoading = true

    try {
      const mergedParams = { ...store.currentFilters, ...params }
      const res = await userRoleApi.getUsers(mergedParams)

      store.users = res.data?.data ?? []
      store.paginationMeta = res.data?.meta ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    } catch (error) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pengguna.'),
      )
    } finally {
      store.isLoading = false
    }
  },

  handleUpdateFilters: (filters: UserRoleQueryParams) => {
    const store = useUserRoleStore()
    store.currentFilters = filters
    void userRoleService.fetchTableData()
  },

  toggleAdmin: async (userId: string, isAdmin: boolean) => {
    const store = useUserRoleStore()
    store.isUpdating = true

    try {
      const rolesRes = await userRoleApi.getRoles()
      const rolesList = rolesRes.data?.data ?? []
      const adminRole = rolesList.find((r) => r.code === 'ADMIN')

      if (!adminRole) {
        throw new Error('Role Administrator tidak ditemukan.')
      }

      if (isAdmin) {
        await userRoleApi.unassignRole(adminRole.id, userId)
        toast.success('Berhasil mencabut akses admin')
      } else {
        await userRoleApi.assignRole(adminRole.id, userId)
        toast.success('Berhasil menjadikan pengguna sebagai admin')
      }
      void userRoleService.fetchTableData()
      return true
    } catch (error) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui role pengguna.'),
      )
      return false
    } finally {
      store.isUpdating = false
    }
  },

  assignRole: async (roleId: string, userId: string) => {
    const store = useUserRoleStore()
    store.isUpdating = true

    try {
      await userRoleApi.assignRole(roleId, userId)
      toast.success('Berhasil menetapkan role ke pengguna')
      void userRoleService.fetchTableData()
      return true
    } catch (error) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menetapkan role.'))
      return false
    } finally {
      store.isUpdating = false
    }
  },

  unassignRole: async (roleId: string, userId: string) => {
    const store = useUserRoleStore()
    store.isUpdating = true

    try {
      await userRoleApi.unassignRole(roleId, userId)
      toast.success('Berhasil mencabut role dari pengguna')
      void userRoleService.fetchTableData()
      return true
    } catch (error) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mencabut role.'))
      return false
    } finally {
      store.isUpdating = false
    }
  },

  /**
   * Reconcile a user's roles against a target selection in one action.
   * Diffs the target against the original set, then assigns/unassigns only
   * the roles that changed. The backend exposes no bulk endpoint, so the
   * calls are issued sequentially.
   */
  syncUserRoles: async (
    userId: string,
    originalRoleIds: string[],
    targetRoleIds: string[],
  ) => {
    const toAdd = targetRoleIds.filter((id) => !originalRoleIds.includes(id))
    const toRemove = originalRoleIds.filter((id) => !targetRoleIds.includes(id))

    if (toAdd.length === 0 && toRemove.length === 0) {
      return true
    }

    const store = useUserRoleStore()
    store.isUpdating = true

    try {
      for (const roleId of toAdd) {
        await userRoleApi.assignRole(roleId, userId)
      }
      for (const roleId of toRemove) {
        await userRoleApi.unassignRole(roleId, userId)
      }
      toast.success('Berhasil memperbarui role pengguna')
      void userRoleService.fetchTableData()
      return true
    } catch (error) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui role pengguna.'),
      )
      // Refresh so the UI reflects whatever changes did land before the error.
      void userRoleService.fetchTableData()
      return false
    } finally {
      store.isUpdating = false
    }
  },
}
