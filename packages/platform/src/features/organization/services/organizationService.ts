import { organizationApi } from '../api/organizationApi'
import { useOrganizationStore } from '../stores/organizationStore'
import { useAuthStore } from '@/features/platform/auth'
import type { Organization } from '../types'
import { toOrganization } from '../utils'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

type OrganizationStore = ReturnType<typeof useOrganizationStore>

function applyOrganizationData(
  store: OrganizationStore,
  data: Partial<Organization> | null,
) {
  const nextOrg = toOrganization(data)
  Object.assign(store.organization, nextOrg)
  Object.assign(store.draftOrganization, nextOrg)
}

export const organizationService = {
  loadOrganizationData: async () => {
    const store = useOrganizationStore()
    const authStore = useAuthStore()
    const orgId = authStore.user?.organizationId

    if (!orgId) {
      store.loadError = 'ID Yayasan tidak ditemukan dalam sesi.'
      store.isLoading = false
      return
    }

    store.isLoading = true
    store.loadError = null

    try {
      const res = await organizationApi.getOrganization(orgId)
      applyOrganizationData(store, res.data.data)
    } catch (error: unknown) {
      store.loadError = getIndonesianErrorMessage(
        error,
        'Gagal memuat data Yayasan dari backend.',
      )
      applyOrganizationData(store, null)
    } finally {
      store.isLoading = false
    }
  },

  initializeEditForm: () => {
    const store = useOrganizationStore()
    store.organizationFormError = null
    Object.assign(store.draftOrganization, store.organization)
  },

  saveOrganizationInfo: async () => {
    const store = useOrganizationStore()
    const authStore = useAuthStore()
    const orgId = authStore.user?.organizationId

    if (!orgId) {
      store.organizationFormError = 'ID Yayasan tidak ditemukan.'
      toast.error('Gagal menyimpan informasi Yayasan.', {
        description: store.organizationFormError,
      })
      return
    }

    store.organizationFormError = null
    store.isSaving = true

    try {
      const res = await organizationApi.updateOrganization(
        orgId,
        store.draftOrganization,
      )
      applyOrganizationData(store, res.data.data)
      toast.success('Informasi Yayasan berhasil disimpan.')
    } catch (error: unknown) {
      store.organizationFormError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan informasi Yayasan.',
      )
      toast.error('Gagal menyimpan informasi Yayasan.', {
        description: store.organizationFormError,
      })
    } finally {
      store.isSaving = false
    }
  },
}
