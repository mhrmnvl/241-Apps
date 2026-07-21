import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { timeSlotApi } from '../api/timeSlotApi'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type { TimeSlotType } from '../types'

export interface EditableTimeSlotTypeRow {
  id: string | null
  code: string
  name: string
  isLesson: boolean
  days: string[]
  saving: boolean
  original: string
}

export const WEEK_DAYS: { value: string; label: string }[] = [
  { value: 'MONDAY', label: 'Sen' },
  { value: 'TUESDAY', label: 'Sel' },
  { value: 'WEDNESDAY', label: 'Rab' },
  { value: 'THURSDAY', label: 'Kam' },
  { value: 'FRIDAY', label: 'Jum' },
  { value: 'SATURDAY', label: 'Sab' },
]

function snapshot(row: EditableTimeSlotTypeRow): string {
  return JSON.stringify({
    code: row.code,
    name: row.name,
    isLesson: row.isLesson,
    days: [...row.days].sort(),
  })
}

function toRow(type: TimeSlotType): EditableTimeSlotTypeRow {
  const row: EditableTimeSlotTypeRow = {
    id: type.id,
    code: type.code,
    name: type.name,
    isLesson: type.isLesson ?? true,
    days: [...(type.days ?? [])],
    saving: false,
    original: '',
  }
  row.original = snapshot(row)
  return row
}

function validate(row: EditableTimeSlotTypeRow): string | null {
  if (!row.code.trim()) return 'Kode wajib diisi.'
  if (!row.name.trim()) return 'Nama wajib diisi.'
  return null
}

export function useTimeSlotTypeManager() {
  const rows = ref<EditableTimeSlotTypeRow[]>([])
  const loading = ref(false)

  function isDirty(row: EditableTimeSlotTypeRow): boolean {
    return row.id === null || snapshot(row) !== row.original
  }

  async function load() {
    loading.value = true
    try {
      const res = await timeSlotApi.getTimeSlotTypes()
      rows.value = (res.data.data ?? []).map(toRow)
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat tipe jam.'))
    } finally {
      loading.value = false
    }
  }

  function addRow() {
    rows.value.push({
      id: null,
      code: '',
      name: '',
      isLesson: true,
      days: [],
      saving: false,
      original: '',
    })
  }

  function toggleDay(row: EditableTimeSlotTypeRow, day: string) {
    const index = row.days.indexOf(day)
    if (index >= 0) row.days.splice(index, 1)
    else row.days.push(day)
  }

  async function deleteRow(row: EditableTimeSlotTypeRow, index: number) {
    if (row.id === null) {
      rows.value.splice(index, 1)
      return { success: true }
    }
    try {
      await timeSlotApi.deleteTimeSlotType(row.id)
      rows.value.splice(index, 1)
      toast.success('Tipe jam dihapus')
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus tipe jam.'))
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
        toast.error(`${row.code || 'Baris baru'}: ${error}`)
        return { success: false }
      }
    }

    loading.value = true
    try {
      await Promise.all(
        dirtyRows.map(async (row) => {
          row.saving = true
          const payload = {
            code: row.code.trim(),
            name: row.name.trim(),
            isLesson: row.isLesson,
            days: row.days,
          }
          if (row.id) {
            await timeSlotApi.updateTimeSlotType(row.id, payload)
          } else {
            const res = await timeSlotApi.createTimeSlotType(payload)
            row.id = res.data.data.id
          }
          row.original = snapshot(row)
          row.saving = false
        }),
      )
      toast.success('Perubahan tipe jam berhasil disimpan')
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan tipe jam.'))
      await load()
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const hasChanges = computed(() => rows.value.some(isDirty))

  return {
    rows,
    loading,
    hasChanges,
    load,
    addRow,
    toggleDay,
    deleteRow,
    saveAll,
    isDirty,
  }
}
