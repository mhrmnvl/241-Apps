import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { employeeAttendanceApi } from '../api/employeeAttendanceApi'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import type { CorrectPresencePayload, CreatePresencePayload } from '../types'

export const employeeAttendanceService = {
  fetchDay: async () => {
    const store = useEmployeeAttendanceStore()
    store.loading = true
    try {
      const res = await employeeAttendanceApi.getDay({
        date: store.selectedDate,
        subjectType: 'EMPLOYEE',
        limit: 200,
        ...(store.statusFilter && { status: store.statusFilter }),
      })
      store.days = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat kehadiran hari ini.'),
      )
      store.days = []
    } finally {
      store.loading = false
    }
  },

  fetchDetail: async (id: string) => {
    const store = useEmployeeAttendanceStore()
    try {
      const res = await employeeAttendanceApi.getDetail(id)
      store.detail = res.data?.data ?? null
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat riwayat koreksi.'),
      )
      store.detail = null
    }
  },

  correct: async (id: string, payload: CorrectPresencePayload) => {
    const store = useEmployeeAttendanceStore()
    store.isSaving = true
    try {
      await employeeAttendanceApi.correct(id, payload)
      toast.success('Koreksi tersimpan.')
      await employeeAttendanceService.fetchDay()
      return true
    } catch (error: unknown) {
      // The API refuses a self-edit and a closed period with specific messages;
      // surfacing them verbatim is more useful than a generic failure.
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan koreksi.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  createManual: async (payload: CreatePresencePayload) => {
    const store = useEmployeeAttendanceStore()
    store.isSaving = true
    try {
      await employeeAttendanceApi.create(payload)
      toast.success('Kehadiran dicatat manual.')
      await employeeAttendanceService.fetchDay()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mencatat kehadiran.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  fetchRecap: async () => {
    const store = useEmployeeAttendanceStore()
    store.loading = true
    try {
      const res = await employeeAttendanceApi.getRecap({
        year: store.recapYear,
        month: store.recapMonth,
        subjectType: 'EMPLOYEE',
      })
      store.recap = res.data?.data ?? null
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat rekap.'))
      store.recap = null
    } finally {
      store.loading = false
    }
  },

  /**
   * Exported from the same endpoint the screen reads, so the two cannot
   * diverge (FR-038). Rendered as CSV client-side rather than shipping a
   * spreadsheet library for a flat table.
   */
  exportRecap: async () => {
    const store = useEmployeeAttendanceStore()
    try {
      const res = await employeeAttendanceApi.exportRecap({
        year: store.recapYear,
        month: store.recapMonth,
        subjectType: 'EMPLOYEE',
      })
      const rows = res.data?.data ?? []
      if (rows.length === 0) {
        toast.info('Tidak ada data untuk diekspor.')
        return
      }
      downloadCsv(
        rows,
        `rekap-kehadiran-${store.recapYear}-${store.recapMonth}`,
      )
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengekspor rekap.'))
    }
  },

  fetchMine: async (year?: number, month?: number) => {
    const store = useEmployeeAttendanceStore()
    store.loading = true
    try {
      const res = await employeeAttendanceApi.getMine({ year, month })
      store.mine = res.data?.data ?? null
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat kehadiran Anda.'),
      )
      store.mine = null
    } finally {
      store.loading = false
    }
  },
}

function downloadCsv(
  rows: Record<string, string | number>[],
  filename: string,
) {
  const headers = Object.keys(rows[0] ?? {})
  const escape = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((key) => escape(row[key] ?? '')).join(','),
    ),
  ].join('\n')

  // The BOM is what makes Excel open a UTF-8 CSV without mangling Indonesian
  // names — without it "Ahmad Fauzi" survives but accented characters do not.
  const blob = new Blob([`\ufeff${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
