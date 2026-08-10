<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import {
  loading,
  patterns,
  workPatternService,
} from '../services/workPatternService'
import { defaultWeek, WEEKDAY_LABEL } from '../types'
import type { WorkPattern, WorkPatternDay } from '../types'

const editing = ref<WorkPattern | null>(null)
const showForm = ref(false)

const name = ref('')
const graceMinutes = ref(10)
const isDefault = ref(false)
const days = ref<WorkPatternDay[]>(defaultWeek())

function startNew() {
  editing.value = null
  name.value = ''
  graceMinutes.value = 10
  isDefault.value = false
  days.value = defaultWeek()
  showForm.value = true
}

function startEdit(pattern: WorkPattern) {
  editing.value = pattern
  name.value = pattern.name
  graceMinutes.value = pattern.graceMinutes
  isDefault.value = pattern.isDefault
  // Always a complete week: the API refuses a partial one, and a pattern
  // stored before all seven days existed would otherwise be uneditable.
  days.value = pattern.days.length === 7 ? [...pattern.days] : defaultWeek()
  showForm.value = true
}

async function save() {
  const ok = await workPatternService.savePattern(
    {
      ...(editing.value ? { id: editing.value.id } : {}),
      name: name.value,
      graceMinutes: graceMinutes.value,
      isDefault: isDefault.value,
    },
    days.value,
  )
  if (ok) showForm.value = false
}

function summarise(pattern: WorkPattern) {
  const working = pattern.days.filter((day) => day.isWorkingDay)
  if (working.length === 0) return '—'
  return `${working.length} hari kerja`
}

onMounted(() => void workPatternService.fetchPatterns())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Pola Kerja</h1>
        <p class="text-muted-foreground text-sm">
          Mengubah pola tidak mengubah hari yang sudah tercatat — setiap hari
          menyimpan pola yang menilainya.
        </p>
      </div>
      <Button @click="startNew">
        <Plus class="mr-2 h-4 w-4" />
        Pola Baru
      </Button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="pattern in patterns"
        :key="pattern.id"
        type="button"
        class="hover:bg-accent rounded-lg border p-4 text-left"
        @click="startEdit(pattern)"
      >
        <div class="flex items-center gap-2">
          <span class="font-medium">{{ pattern.name }}</span>
          <Badge
            v-if="pattern.isDefault"
            variant="default"
            >Default</Badge
          >
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ summarise(pattern) }} · toleransi {{ pattern.graceMinutes }} menit
        </p>
      </button>

      <p
        v-if="!loading && patterns.length === 0"
        class="text-muted-foreground col-span-full py-10 text-center text-sm"
      >
        Belum ada pola kerja.
      </p>
    </div>

    <div
      v-if="showForm"
      class="space-y-4 rounded-lg border p-4"
    >
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1">
          <Label for="pattern-name">Nama</Label>
          <Input
            id="pattern-name"
            v-model="name"
            placeholder="Piket"
          />
        </div>
        <div class="space-y-1">
          <Label for="pattern-grace">Toleransi (menit)</Label>
          <Input
            id="pattern-grace"
            v-model.number="graceMinutes"
            type="number"
            min="0"
            max="120"
          />
        </div>
        <div class="flex items-end gap-2">
          <input
            id="pattern-default"
            v-model="isDefault"
            type="checkbox"
          />
          <Label for="pattern-default">Jadikan default</Label>
        </div>
      </div>

      <!-- All seven, always. A partial week would silently make a weekday
           non-working for everyone assigned. -->
      <div class="space-y-2">
        <Label>Jam kerja per hari</Label>
        <div
          v-for="day in days"
          :key="day.weekday"
          class="grid grid-cols-[8rem_auto_1fr_1fr] items-center gap-3"
        >
          <span class="text-sm">{{ WEEKDAY_LABEL[day.weekday] }}</span>
          <input
            v-model="day.isWorkingDay"
            type="checkbox"
          />
          <Input
            v-model="day.startTime"
            type="time"
            :disabled="!day.isWorkingDay"
          />
          <Input
            v-model="day.endTime"
            type="time"
            :disabled="!day.isWorkingDay"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Button @click="save">Simpan</Button>
        <Button
          variant="outline"
          @click="showForm = false"
          >Batal</Button
        >
        <Button
          v-if="editing && !editing.isDefault"
          variant="ghost"
          class="text-red-600"
          @click="workPatternService.deletePattern(editing.id)"
        >
          Hapus
        </Button>
      </div>
    </div>
  </div>
</template>
