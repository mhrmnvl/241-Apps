import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { timeSlotApi } from '../api/timeSlotApi'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import type { TimeSlot, TimeSlotType } from '../types'

export interface EditableTimeSlotRow {
  id: string | null
  name: string
  startTime: string
  endTime: string
  order: number
  typeId: string
  saving: boolean
  original: string
}

function toHHMM(isoOrTime: string): string {
  if (!isoOrTime) return ''
  const date = new Date(isoOrTime)
  if (!isNaN(date.getTime())) return date.toISOString().substring(11, 16)
  return isoOrTime.substring(0, 5)
}

function snapshot(row: EditableTimeSlotRow): string {
  return JSON.stringify({
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    order: row.order,
    typeId: row.typeId,
  })
}

function toRow(timeSlot: TimeSlot): EditableTimeSlotRow {
  const row: EditableTimeSlotRow = {
    id: timeSlot.id,
    name: timeSlot.name ?? '',
    startTime: toHHMM(timeSlot.startTime),
    endTime: toHHMM(timeSlot.endTime),
    order: timeSlot.order ?? 1,
    typeId: timeSlot.type?.id ?? timeSlot.typeId ?? '',
    saving: false,
    original: '',
  }
  row.original = snapshot(row)
  return row
}

function validate(row: EditableTimeSlotRow): string | null {
  if (!row.name.trim()) return 'Nama jam wajib diisi.'
  if (!row.startTime) return 'Waktu mulai wajib diisi.'
  if (!row.endTime) return 'Waktu selesai wajib diisi.'
  if (!row.typeId) return 'Tipe jam wajib dipilih.'
  if (row.order < 1) return 'Urutan minimal 1.'
  return null
}

export function useTimeSlotManager() {
  const rows = ref<EditableTimeSlotRow[]>([])
  const types = ref<TimeSlotType[]>([])
  const loading = ref(false)

  function isDirty(row: EditableTimeSlotRow): boolean {
    return row.id === null || snapshot(row) !== row.original
  }

  async function load() {
    loading.value = true
    try {
      const [timeSlotRes, typeRes] = await Promise.all([
        timeSlotApi.getTimeSlots({ limit: PAGINATION.REFERENCE_LIMIT }),
        timeSlotApi.getTimeSlotTypes(),
      ])
      rows.value = (timeSlotRes.data.data ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(toRow)
      types.value = typeRes.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data jam pelajaran.'),
      )
    } finally {
      loading.value = false
    }
  }

  function addRow() {
    const maxOrder = rows.value.reduce(
      (max, row) => Math.max(max, row.order),
      0,
    )
    rows.value.push({
      id: null,
      name: '',
      startTime: '07:00',
      endTime: '07:30',
      order: maxOrder + 1,
      typeId: types.value[0]?.id ?? '',
      saving: false,
      original: '',
    })
  }

  async function saveRow(row: EditableTimeSlotRow) {
    const error = validate(row)
    if (error) {
      toast.error(error)
      return { success: false }
    }

    row.saving = true
    try {
      const payload = {
        name: row.name.trim(),
        startTime: row.startTime,
        endTime: row.endTime,
        order: row.order,
        typeId: row.typeId,
      }
      if (row.id) {
        await timeSlotApi.updateTimeSlot(row.id, payload)
        toast.success('Jam pelajaran diperbarui')
      } else {
        const res = await timeSlotApi.createTimeSlot(payload)
        row.id = res.data.data.id
        toast.success('Jam pelajaran ditambahkan')
      }
      row.original = snapshot(row)
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan jam pelajaran.'),
      )
      return { success: false }
    } finally {
      row.saving = false
    }
  }

  async function deleteRow(row: EditableTimeSlotRow, index: number) {
    if (row.id === null) {
      rows.value.splice(index, 1)
      return { success: true }
    }
    try {
      await timeSlotApi.deleteTimeSlot(row.id)
      rows.value.splice(index, 1)
      toast.success('Jam pelajaran dihapus')
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus jam pelajaran.'),
      )
      return { success: false }
    }
  }

  async function saveAll() {
    const dirtyRows = rows.value.filter(isDirty)
    if (dirtyRows.length === 0) {
      toast.info('Tidak ada perubahan untuk disimpan.')
      return { success: true }
    }

    for (const row of dirtyRows) {
      const error = validate(row)
      if (error) {
        toast.error(`Baris urutan ke-${row.order}: ${error}`)
        return { success: false }
      }
    }

    loading.value = true
    try {
      await Promise.all(
        dirtyRows.map(async (row) => {
          row.saving = true
          const payload = {
            name: row.name.trim(),
            startTime: row.startTime,
            endTime: row.endTime,
            order: row.order,
            typeId: row.typeId,
          }
          if (row.id) {
            await timeSlotApi.updateTimeSlot(row.id, payload)
          } else {
            const res = await timeSlotApi.createTimeSlot(payload)
            row.id = res.data.data.id
          }
          row.original = snapshot(row)
          row.saving = false
        }),
      )
      toast.success('Semua perubahan jam pelajaran berhasil disimpan')
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal menyimpan beberapa jam pelajaran.',
        ),
      )
      await load()
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const hasChanges = computed(() => rows.value.some(isDirty))

  return {
    rows,
    types,
    loading,
    hasChanges,
    load,
    addRow,
    saveRow,
    saveAll,
    deleteRow,
    isDirty,
  }
}
