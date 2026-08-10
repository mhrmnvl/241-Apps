import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { credentialApi } from '../api/credentialApi'
import { useCredentialStore } from '../stores/credentialStore'
import type { IssueCredentialPayload, RevokeCredentialPayload } from '../types'

export const credentialService = {
  fetchCredentials: async () => {
    const store = useCredentialStore()
    store.loading = true
    try {
      const res = await credentialApi.getCredentials({
        page: store.page,
        limit: store.limit,
        ...(store.search && { search: store.search }),
        ...(store.subjectType && { subjectType: store.subjectType }),
        ...(store.status && { status: store.status }),
      })
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? store.items.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data kartu.'))
    } finally {
      store.loading = false
    }
  },

  /**
   * Keeps the issued card in memory so the dialog can show its code once. The
   * server will not return it again on any later read.
   */
  issue: async (payload: IssueCredentialPayload) => {
    const store = useCredentialStore()
    store.isSaving = true
    try {
      const res = await credentialApi.issue(payload)
      store.lastIssued = res.data?.data ?? null
      toast.success('Kartu diterbitkan. Salin atau cetak kodenya sekarang.')
      await credentialService.fetchCredentials()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menerbitkan kartu.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  revoke: async (id: string, payload: RevokeCredentialPayload) => {
    const store = useCredentialStore()
    store.isSaving = true
    try {
      await credentialApi.revoke(id, payload)
      toast.success('Kartu dicabut.')
      await credentialService.fetchCredentials()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mencabut kartu.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  replace: async (id: string, payload: RevokeCredentialPayload) => {
    const store = useCredentialStore()
    store.isSaving = true
    try {
      const res = await credentialApi.replace(id, payload)
      store.lastIssued = res.data?.data ?? null
      toast.success('Kartu pengganti diterbitkan.')
      await credentialService.fetchCredentials()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengganti kartu.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  loadPrintBatch: async (userIds: string[]) => {
    const store = useCredentialStore()
    store.loading = true
    try {
      const res = await credentialApi.getForPrint(userIds)
      store.printBatch = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data untuk dicetak.'),
      )
      store.printBatch = []
    } finally {
      store.loading = false
    }
  },
}
