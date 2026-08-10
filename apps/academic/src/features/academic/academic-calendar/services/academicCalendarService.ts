import { academicCalendarApi } from '../api/academicCalendarApi'
import { useAcademicCalendarStore } from '../stores/academicCalendarStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import type {
  CalendarQueryParams,
  CalendarSavePayload,
  CalendarEventData,
  CalendarRange,
  FilterPayload,
  CalendarCreatePayload,
} from '../types'

function normalizeCalendar(c: CalendarEventData): CalendarEventData {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    typeId: c.typeId,
    type: c.type,
    startDate: c.startDate,
    endDate: c.endDate,
    academicYearId: c.academicYearId,
    semesterId: c.semesterId,
  }
}

function extractList(res: {
  data?: ApiPaginatedResponse<CalendarEventData>
}): CalendarEventData[] {
  const d = res.data?.data
  if (Array.isArray(d)) return d
  return []
}

export const academicCalendarService = {
  fetchEvents: async (range: CalendarRange) => {
    const store = useAcademicCalendarStore()
    store.currentRange = range
    store.loading = true
    try {
      const params: CalendarQueryParams = { limit: PAGINATION.REFERENCE_LIMIT }
      const calRes = await academicCalendarApi.getCalendars(params)
      const cals = extractList(calRes)
      store.events = cals.map(normalizeCalendar)
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat kalender.'))
    } finally {
      store.loading = false
    }
  },

  fetchTableEvents: async () => {
    const store = useAcademicCalendarStore()
    store.tableLoading = true
    try {
      const params: CalendarQueryParams = { limit: PAGINATION.REFERENCE_LIMIT }
      const calRes = await academicCalendarApi.getCalendars(params)
      const cals = extractList(calRes)

      let allEvents: CalendarEventData[] = cals.map(normalizeCalendar)

      if (store.currentFilters.type && store.currentFilters.type !== 'ALL') {
        allEvents = allEvents.filter(
          (e) => e.typeId === store.currentFilters.type,
        )
      }

      store.tableEvents = allEvents
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat daftar tabel.'),
      )
    } finally {
      store.tableLoading = false
    }
  },

  handleUpdateFilters: (filters: FilterPayload) => {
    const store = useAcademicCalendarStore()
    store.currentFilters = filters
    void academicCalendarService.fetchTableEvents()
  },

  deleteBulk: async (ids: string[]) => {
    const store = useAcademicCalendarStore()
    if (!ids.length) return false
    store.isDeletingBulk = true
    try {
      await academicCalendarApi.deleteBulkCalendars(ids)
      toast.success(`${ids.length} item berhasil dihapus.`)
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Terjadi kesalahan saat penghapusan massal.',
        ),
      )
      return false
    } finally {
      store.isDeletingBulk = false
    }
  },

  saveCalendar: async (id: string | null, payload: CalendarSavePayload) => {
    try {
      const calPayload: CalendarCreatePayload = {
        academicYearId: payload.academicYearId ?? '',
        title: payload.title,
        description: payload.description,
        typeId: payload.typeId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        semesterId: payload.semesterId,
      }
      if (id) {
        await academicCalendarApi.updateCalendar(id, calPayload)
      } else {
        await academicCalendarApi.createCalendar(calPayload)
      }

      toast.success(
        id ? 'Kegiatan berhasil diperbarui.' : 'Kegiatan berhasil ditambahkan.',
      )
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan kegiatan.'))
      return false
    }
  },

  deleteCalendar: async (id: string) => {
    try {
      await academicCalendarApi.deleteCalendar(id)
      toast.success('Jadwal berhasil dihapus')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus jadwal'))
      return false
    }
  },
}
