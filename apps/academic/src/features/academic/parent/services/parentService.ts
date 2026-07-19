import { parentApi } from '../api/parentApi'
import { useParentStore } from '../stores/parentStore'
import type { ParentSavePayload } from '../types'
import { occupationApi } from '@/features/academic/occupation'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const parentService = {
  fetchFilterOptions: async () => {
    const store = useParentStore()
    try {
      const res = await occupationApi.getOccupations({ limit: 100 })
      store.occupations = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pekerjaan.'),
      )
    }
  },

  fetchParents: async () => {
    const store = useParentStore()
    store.loading = true
    try {
      const params = {
        limit: 100,
        ...(store.searchQuery ? { search: store.searchQuery } : {}),
        ...(store.selectedOccupationId
          ? { occupationId: store.selectedOccupationId }
          : {}),
      }
      const res = await parentApi.getParents(params)
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data orang tua.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveParent: async (id: string | null, payload: ParentSavePayload) => {
    const store = useParentStore()
    store.isSaving = true
    store.formError = null
    try {
      const promise = id
        ? parentApi.updateParent(id, payload)
        : parentApi.createParent(payload)

      toast.promise(promise, {
        loading: id ? 'Menyimpan perubahan...' : 'Membuat data orang tua...',
        success: id
          ? 'Data orang tua berhasil diperbarui.'
          : 'Data orang tua berhasil dibuat.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal menyimpan data orang tua.'),
      })

      await promise
      await parentService.fetchParents()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data orang tua.',
      )
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  deleteParent: async (id: string) => {
    try {
      const promise = parentApi.deleteParent(id)
      toast.promise(promise, {
        loading: 'Menghapus data orang tua...',
        success: 'Data orang tua berhasil dihapus.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal menghapus data orang tua.'),
      })
      await promise
      await parentService.fetchParents()
      return { success: true }
    } catch {
      return { success: false }
    }
  },
}
