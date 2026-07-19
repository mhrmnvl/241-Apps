import { ref } from 'vue'
import { tenantApi } from '../api/tenantApi'
import type { TenantProfile } from '../types/tenant.types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

export function useTenant() {
  const tenants = ref<TenantProfile[]>([])
  const tenant = ref<TenantProfile | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const fetchTenants = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await tenantApi.getTenants()
      tenants.value = response.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal memuat data tenant')
    } finally {
      isLoading.value = false
    }
  }

  const fetchTenantById = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await tenantApi.getTenantById(id)
      tenant.value = response.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal memuat detail tenant')
    } finally {
      isLoading.value = false
    }
  }

  const createTenant = async (payload: Partial<TenantProfile>) => {
    isSaving.value = true
    error.value = null
    try {
      const response = await tenantApi.createTenant(payload)
      return response.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal membuat tenant')
      throw err
    } finally {
      isSaving.value = false
    }
  }

  const updateTenant = async (id: string, payload: Partial<TenantProfile>) => {
    isSaving.value = true
    error.value = null
    try {
      const response = await tenantApi.updateTenant(id, payload)
      return response.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal memperbarui tenant')
      throw err
    } finally {
      isSaving.value = false
    }
  }

  const deleteTenant = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await tenantApi.deleteTenant(id)
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal menghapus tenant')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    tenants,
    tenant,
    isLoading,
    isSaving,
    error,
    fetchTenants,
    fetchTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
  }
}
