<script setup lang="ts">
import { computed, ref } from 'vue'
import { DataTable } from '@/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { createAttendanceInputColumns } from './attendanceInputColumns'
import type { AttendanceInputRow, AttendanceStatus } from '../types'
import {
  ATTENDANCE_STATUS_OPTIONS,
  toAttendanceStatus,
} from '../constants/attendance-status'

// `isSaving` and a `save` event were declared here and never read: the Save
// button lives in the view, which owns the mutation. A contract nothing
// fulfils is worse than no contract — it says the parent may listen when
// nothing will ever fire.
const props = defineProps<{
  rows: AttendanceInputRow[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:rows': [value: AttendanceInputRow[]]
}>()

const selectedRows = ref<AttendanceInputRow[]>([])

function confirmed(row: AttendanceInputRow): AttendanceInputRow {
  return { ...row, fromGate: false, needsDecision: false }
}

function handleStatusChange(enrollmentId: string, status: AttendanceStatus) {
  const index = props.rows.findIndex((r) => r.enrollmentId === enrollmentId)
  if (index === -1) return
  const updated = [...props.rows]
  const row = updated[index]
  if (!row) return
  updated[index] = { ...confirmed(row), status }
  emit('update:rows', updated)
}

function handleNoteChange(enrollmentId: string, note: string) {
  const index = props.rows.findIndex((r) => r.enrollmentId === enrollmentId)
  if (index === -1) return
  const updated = [...props.rows]
  const row = updated[index]
  if (!row) return
  updated[index] = { ...confirmed(row), note }
  emit('update:rows', updated)
}

function applyBulkStatus(value: unknown) {
  const status = toAttendanceStatus(value)
  if (!status || selectedRows.value.length === 0) return
  const selectedIds = new Set(selectedRows.value.map((r) => r.enrollmentId))
  const updated = props.rows.map((row) => {
    if (selectedIds.has(row.enrollmentId)) {
      return { ...confirmed(row), status }
    }
    return row
  })
  emit('update:rows', updated)
}

function handleSelectionChange(rows: AttendanceInputRow[]) {
  selectedRows.value = rows
}

const columns = computed(() =>
  createAttendanceInputColumns({
    onStatusChange: handleStatusChange,
    onNoteChange: handleNoteChange,
  }),
)

// Ensure each row has `id` property for DataTable row selection tracking and sort alphabetically by student name
const tableData = computed(() =>
  [...props.rows]
    .sort((a, b) =>
      (a.studentName ?? '').localeCompare(b.studentName ?? '', 'id'),
    )
    .map((r) => ({
      ...r,
      id: r.enrollmentId,
    })),
)
</script>

<template>
  <div class="space-y-4">
    <!-- Aksi Massal Pilihan Siswa -->
    <div
      v-if="rows.length > 0"
      class="flex flex-wrap items-center gap-3 text-xs"
    >
      <span class="font-medium text-foreground">
        {{ selectedRows.length }} dari {{ rows.length }} siswa dipilih
      </span>

      <!-- Pilihan massal status kehadiran -->
      <Select
        :disabled="selectedRows.length === 0"
        :model-value="undefined"
        @update:model-value="applyBulkStatus"
      >
        <SelectTrigger class="h-8 w-44 text-xs">
          <SelectValue
            :placeholder="`Ubah status (${selectedRows.length}) ke...`"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in ATTENDANCE_STATUS_OPTIONS"
            :key="option.value"
            :value="option.value"
            class="text-xs"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- DataTable -->
    <DataTable
      :columns="columns"
      :data="tableData"
      :is-loading="loading"
      item-label="siswa"
      filter-column="studentName"
      filter-placeholder="Cari nama siswa..."
      :hide-per-page="true"
      :hide-pagination="true"
      :page-size="500"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>
