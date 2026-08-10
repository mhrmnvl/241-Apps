<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Loader2, Save } from 'lucide-vue-next'
import type { AttendanceInputRow, AttendanceStatus } from '../types'

const props = defineProps<{
  rows: AttendanceInputRow[]
  loading: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  'update:rows': [value: AttendanceInputRow[]]
  save: []
}>()

/**
 * The moment a teacher touches a row it stops being the gate's suggestion and
 * becomes their value, so both flags are cleared. Leaving them would keep
 * showing "belum dikonfirmasi" over a value the teacher just chose.
 */
function confirmed(row: AttendanceInputRow): AttendanceInputRow {
  return { ...row, fromGate: false, needsDecision: false }
}

function updateRowStatus(index: number, status: AttendanceStatus) {
  const row = props.rows[index]
  if (!row) return
  const updated = [...props.rows]
  updated[index] = { ...confirmed(row), status }
  emit('update:rows', updated)
}

function updateRowNote(index: number, note: string) {
  const row = props.rows[index]
  if (!row) return
  const updated = [...props.rows]
  updated[index] = { ...confirmed(row), note }
  emit('update:rows', updated)
}

/** "2026-08-10T07:25:00.000Z" → "07:25" */
function gateTime(value: string) {
  return new Date(value).toISOString().slice(11, 16)
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12 text-center">No</TableHead>
            <TableHead class="w-28">NIS</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead class="w-40">Status</TableHead>
            <TableHead class="w-48">Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(row, index) in rows"
            :key="row.enrollmentId"
          >
            <TableCell class="text-center">{{ index + 1 }}</TableCell>
            <TableCell>{{ row.nis }}</TableCell>
            <TableCell>
              <div class="flex flex-wrap items-center gap-2">
                <span>{{ row.studentName }}</span>

                <!-- FR-017: pre-filled, not confirmed. The badge disappears the
                     moment the teacher touches the row, because from then on it
                     is their value rather than the gate's. -->
                <span
                  v-if="row.fromGate"
                  class="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                >
                  dari gerbang, belum dikonfirmasi
                </span>

                <!-- FR-018: the gate saw nothing. That is not evidence of
                     absence — it needs a decision. -->
                <span
                  v-else-if="row.needsDecision"
                  class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                >
                  perlu keputusan
                </span>
              </div>

              <!-- FR-021: what time they actually arrived, so the teacher can
                   judge a late arrival rather than guess. -->
              <p
                v-if="row.gateCheckInAt"
                class="text-muted-foreground mt-0.5 text-xs"
              >
                Tap gerbang {{ gateTime(row.gateCheckInAt) }}
              </p>
            </TableCell>
            <TableCell>
              <Select
                :model-value="row.status"
                @update:model-value="
                  (val) => updateRowStatus(index, val as AttendanceStatus)
                "
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Hadir</SelectItem>
                  <SelectItem value="SICK">Sakit</SelectItem>
                  <SelectItem value="EXCUSED">Izin</SelectItem>
                  <SelectItem value="ABSENT">Alpha</SelectItem>
                  <SelectItem value="LATE">Telat</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                :model-value="row.note"
                placeholder="Catatan..."
                @update:model-value="
                  (val) => updateRowNote(index, val as string)
                "
              />
            </TableCell>
          </TableRow>
          <TableRow v-if="rows.length === 0">
            <TableCell
              :colspan="5"
              class="h-24 text-center text-muted-foreground"
            >
              {{ loading ? 'Memuat data...' : 'Tidak ada siswa terdaftar.' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div
      v-if="rows.length > 0"
      class="flex justify-end"
    >
      <Button
        :disabled="isSaving"
        @click="$emit('save')"
      >
        <Loader2
          v-if="isSaving"
          class="size-4 mr-2 animate-spin"
        />
        <Save
          v-else
          class="size-4 mr-2"
        />
        {{ isSaving ? 'Menyimpan...' : 'Simpan Semua' }}
      </Button>
    </div>
  </div>
</template>
