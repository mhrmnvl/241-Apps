<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Loader2, Save } from 'lucide-vue-next'
import type { StudentScoreRosterItem } from '../types'

const props = defineProps<{
  rows: StudentScoreRosterItem[]
  loading: boolean
  isSaving: boolean
  maxScore: number
  canSave?: boolean
}>()

const emit = defineEmits<{
  'update:rows': [value: StudentScoreRosterItem[]]
  save: []
}>()

/**
 * Holds the mark inside what the assessment is out of.
 *
 * The `max` attribute on a number input only styles it invalid — it does not
 * stop the typing, and the value still reaches the model. Since every subject
 * average is a percentage of `maxScore`, a mark above it would push a score
 * past 100 and lift the student's rank, so the server rejects it too; clamping
 * here is what keeps the teacher from discovering that on save.
 */
function updateRowScore(index: number, value: string) {
  const row = props.rows[index]
  if (!row) return

  let score: number | null = null
  if (value !== '') {
    const parsed = Number(value)
    score = Number.isNaN(parsed)
      ? null
      : Math.min(Math.max(parsed, 0), props.maxScore)
  }

  const updated = [...props.rows]
  updated[index] = { ...row, score }
  emit('update:rows', updated)
}

function updateRowNote(index: number, note: string) {
  const row = props.rows[index]
  if (!row) return
  const updated = [...props.rows]
  updated[index] = { ...row, note }
  emit('update:rows', updated)
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
            <TableHead class="w-32">Skor</TableHead>
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
            <TableCell>{{ row.studentName }}</TableCell>
            <TableCell>
              <Input
                type="number"
                min="0"
                :max="maxScore"
                :model-value="row.score ?? ''"
                :placeholder="`0 - ${maxScore}`"
                @update:model-value="
                  (val) => updateRowScore(index, String(val))
                "
              />
            </TableCell>
            <TableCell>
              <Input
                :model-value="row.note ?? ''"
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
      v-if="rows.length > 0 && canSave !== false"
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
