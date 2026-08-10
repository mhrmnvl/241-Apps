import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { positionApi } from '../api/positionApi'
import { usePositionStore } from '../stores/positionStore'
import type { PositionSavePayload, PositionQueryParams } from '../types'

export const positionService = {
  fetchPositions: async (params?: PositionQueryParams) => {
    const store = usePositionStore()
    store.loading = true
    try {
      const actualParams = {
        limit: PAGINATION.REFERENCE_LIMIT,
        ...params,
      }
      const res = await positionApi.getPositions(actualParams)
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? res.data?.data?.length ?? 0
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data jabatan.'),
      )
      return { success: false }
    } finally {
      store.loading = false
    }
  },

  savePosition: async (id: string | null, payload: PositionSavePayload) => {
    const store = usePositionStore()
    store.isSaving = true
    store.formError = null
    try {
      const promise = id
        ? positionApi.updatePosition(id, payload)
        : positionApi.createPosition(payload)

      toast.promise(promise, {
        loading: id ? 'Menyimpan perubahan...' : 'Membuat data jabatan...',
        success: id
          ? 'Data jabatan berhasil diperbarui.'
          : 'Data jabatan berhasil dibuat.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal menyimpan data jabatan.'),
      })

      await promise
      await positionService.fetchPositions()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data jabatan.',
      )
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  deletePosition: async (id: string) => {
    try {
      const promise = positionApi.deletePosition(id)
      toast.promise(promise, {
        loading: 'Menghapus data jabatan...',
        success: 'Data jabatan berhasil dihapus.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal menghapus data jabatan.'),
      })
      await promise
      await positionService.fetchPositions()
      return { success: true }
    } catch {
      return { success: false }
    }
  },
}
