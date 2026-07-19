import { eventCalendarApi } from '../api/eventCalendarApi'
import { useEventCalendarStore } from '../stores/eventCalendarStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type {
  EventQueryParams,
  EventCreatePayload,
  EventData,
  EventCalendarRange,
  EventFilterPayload,
} from '../types'

import type { ApiPaginatedResponse } from '@/shared/types/api'

function extractList(res: {
  data?: ApiPaginatedResponse<EventData>
}): EventData[] {
  return res.data?.data ?? []
}

export const eventCalendarService = {
  fetchEvents: async (range: EventCalendarRange) => {
    const store = useEventCalendarStore()
    store.currentRange = range
    store.loading = true
    try {
      const params: EventQueryParams = { limit: 100 }
      const res = await eventCalendarApi.getEvents(params)
      store.events = extractList(res)
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat kalender kegiatan.'),
      )
    } finally {
      store.loading = false
    }
  },

  fetchTableEvents: async () => {
    const store = useEventCalendarStore()
    store.tableLoading = true
    try {
      const params: EventQueryParams = { limit: 100 }
      if (store.currentFilters.classroomId) {
        params.classroomId = store.currentFilters.classroomId
      }
      const res = await eventCalendarApi.getEvents(params)
      store.tableEvents = extractList(res)
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat daftar kegiatan.'),
      )
    } finally {
      store.tableLoading = false
    }
  },

  handleUpdateFilters: (filters: EventFilterPayload) => {
    const store = useEventCalendarStore()
    store.currentFilters = filters
    void eventCalendarService.fetchTableEvents()
  },

  deleteBulk: async (ids: string[]) => {
    const store = useEventCalendarStore()
    if (!ids.length) return false
    store.isDeletingBulk = true
    try {
      await eventCalendarApi.deleteBulkEvents(ids)
      toast.success(`${ids.length} kegiatan berhasil dihapus.`)
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Terjadi kesalahan saat penghapusan massal kegiatan.',
        ),
      )
      return false
    } finally {
      store.isDeletingBulk = false
    }
  },

  saveEvent: async (id: string | null, payload: EventCreatePayload) => {
    try {
      if (id) {
        await eventCalendarApi.updateEvent(id, payload)
      } else {
        await eventCalendarApi.createEvent(payload)
      }
      toast.success(
        id ? 'Kegiatan berhasil diperbarui.' : 'Kegiatan berhasil ditambahkan.',
      )
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan kegiatan.'))
      return { success: false }
    }
  },

  deleteEvent: async (id: string) => {
    try {
      await eventCalendarApi.deleteEvent(id)
      toast.success('Kegiatan berhasil dihapus')
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus kegiatan'))
      return { success: false }
    }
  },
}
