import { lookupService } from '@/features/lookup'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { workPatternApi } from '../api/workPatternApi'
import type {
  AttendancePeriod,
  IncompleteRecord,
  NonWorkingDay,
  WorkPattern,
  WorkPatternAssignment,
  WorkPatternDay,
} from '../types'

export const patterns = ref<WorkPattern[]>([])
export const assignments = ref<WorkPatternAssignment[]>([])
export const nonWorkingDays = ref<NonWorkingDay[]>([])
export const periods = ref<AttendancePeriod[]>([])
export const loading = ref(false)

/** Records blocking a period close, surfaced so TU can act on them. */
export const blockingRecords = ref<IncompleteRecord[]>([])

/** Dates previewed from the academic calendar, before anything is written. */
export const importPreview = ref<
  { date: string; name: string; sourceCalendarId?: string }[]
>([])

export const workPatternService = {
  fetchPatterns: async () => {
    loading.value = true
    try {
      const res = await workPatternApi.getPatterns()
      patterns.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat pola kerja.'))
    } finally {
      loading.value = false
    }
  },

  savePattern: async (
    pattern: {
      id?: string
      name: string
      graceMinutes: number
      isDefault: boolean
    },
    days: WorkPatternDay[],
  ) => {
    try {
      const id =
        pattern.id ??
        (await workPatternApi.createPattern(pattern)).data?.data?.id

      if (!id) throw new Error('Pattern id missing')
      if (pattern.id) await workPatternApi.updatePattern(id, pattern)

      // Days always go as a complete week; the API refuses a partial one.
      await workPatternApi.replaceDays(id, days)
      toast.success('Pola kerja tersimpan.')
      await workPatternService.fetchPatterns()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan pola kerja.'),
      )
      return false
    }
  },

  deletePattern: async (id: string) => {
    try {
      await workPatternApi.deletePattern(id)
      toast.success('Pola kerja dihapus.')
      await workPatternService.fetchPatterns()
    } catch (error: unknown) {
      // The API refuses the default and any pattern still in use, with a
      // message naming why — passing it through is more useful than a generic one.
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus pola kerja.'),
      )
    }
  },

  fetchAssignments: async () => {
    loading.value = true
    try {
      const res = await workPatternApi.getAssignments()
      assignments.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat penugasan.'))
    } finally {
      loading.value = false
    }
  },

  assign: async (payload: {
    userId: string
    workPatternId: string
    effectiveFrom: string
  }) => {
    try {
      await workPatternApi.assign(payload)
      toast.success('Pola kerja ditugaskan.')
      await workPatternService.fetchAssignments()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menugaskan pola kerja.'),
      )
      return false
    }
  },

  fetchNonWorkingDays: async (year: number) => {
    loading.value = true
    try {
      const res = await workPatternApi.getNonWorkingDays({
        from: `${year}-01-01`,
        to: `${year}-12-31`,
      })
      nonWorkingDays.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat hari libur.'))
    } finally {
      loading.value = false
    }
  },

  /**
   * Reads the academic calendar and shows what *would* be imported. Nothing is
   * written until the operator confirms.
   *
   * The composition lives here rather than in the backend on purpose:
   * `academic/` already depends on `presence/`, so a call back the other way
   * would close a domain cycle (research R9). Reading the calendar over HTTP
   * from this app leaves that direction intact. The preview is the bonus —
   * nobody changes what counts as a working day without seeing the list.
   */
  previewFromCalendar: async (academicYearId: string, typeId: string) => {
    try {
      const entries = await lookupService.listCalendarEntries(
        academicYearId,
        typeId,
      )
      importPreview.value = entries.flatMap((entry) =>
        expandDates(entry.startDate, entry.endDate).map((date) => ({
          date,
          name: entry.title,
          sourceCalendarId: entry.id,
        })),
      )

      if (importPreview.value.length === 0) {
        toast.info('Tidak ada tanggal untuk tipe kalender itu.')
      }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal membaca kalender akademik.'),
      )
      importPreview.value = []
    }
  },

  confirmImport: async (year: number) => {
    try {
      const res = await workPatternApi.bulkNonWorkingDays(importPreview.value)
      const result = res.data?.data
      toast.success(
        `${result?.imported ?? 0} hari libur ditambahkan, ${result?.skipped ?? 0} dilewati.`,
      )
      importPreview.value = []
      await workPatternService.fetchNonWorkingDays(year)
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan hari libur.'),
      )
      return false
    }
  },

  deleteNonWorkingDay: async (id: string, year: number) => {
    try {
      await workPatternApi.deleteNonWorkingDay(id)
      await workPatternService.fetchNonWorkingDays(year)
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus hari libur.'),
      )
    }
  },

  fetchPeriods: async (year: number) => {
    loading.value = true
    try {
      const res = await workPatternApi.getPeriods(year)
      periods.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat periode.'))
    } finally {
      loading.value = false
    }
  },

  closePeriod: async (year: number, month: number) => {
    blockingRecords.value = []
    try {
      await workPatternApi.closePeriod(year, month)
      toast.success('Periode ditutup.')
      await workPatternService.fetchPeriods(year)
      return true
    } catch (error: unknown) {
      // The refusal carries the records that blocked it — showing them is the
      // difference between "it failed" and "here is what to fix".
      blockingRecords.value = extractIncomplete(error)
      toast.error(getIndonesianErrorMessage(error, 'Gagal menutup periode.'))
      return false
    }
  },
}

/** Every date from start to end inclusive, as `YYYY-MM-DD`. */
function expandDates(start: string, end: string): string[] {
  const dates: string[] = []
  const cursor = new Date(start)
  const last = new Date(end)

  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
}

function extractIncomplete(error: unknown): IncompleteRecord[] {
  const response = (
    error as { response?: { data?: { incomplete?: IncompleteRecord[] } } }
  )?.response?.data?.incomplete

  return Array.isArray(response) ? response : []
}
