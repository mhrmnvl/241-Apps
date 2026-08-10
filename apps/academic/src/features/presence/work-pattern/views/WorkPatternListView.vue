<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
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
import { WEEKDAY_LABEL, defaultWeek } from '../types'
import type { WorkPattern, WorkPatternDay } from '../types'

const showForm = ref(false)
const editing = ref<WorkPattern | null>(null)
const name = ref('')
const graceMinutes = ref(15)
const isDefault = ref(false)
const days = ref<WorkPatternDay[]>(defaultWeek())

function startNew() {
  editing.value = null
  name.value = ''
  graceMinutes.value = 15
  isDefault.value = false
  days.value = defaultWeek()
  showForm.value = true
}

function startEdit(pattern: WorkPattern) {
  editing.value = pattern
  name.value = pattern.name
  graceMinutes.value = pattern.graceMinutes
  isDefault.value = pattern.isDefault
  days.value = pattern.days.map((d) => ({
    weekday: d.weekday,
    isWorkingDay: d.isWorkingDay,
    startTime: d.startTime ?? '07:00',
    endTime: d.endTime ?? '15:00',
  }))
  showForm.value = true
}

async function save() {
  // One call for both: the service creates when there is no id and replaces
  // all seven days either way, so a partial week can never be written.
  await workPatternService.savePattern(
    {
      ...(editing.value ? { id: editing.value.id } : {}),
      name: name.value,
      graceMinutes: graceMinutes.value,
      isDefault: isDefault.value,
    },
    days.value,
  )
  showForm.value = false
}

function summarise(pattern: WorkPattern) {
  const working = pattern.days.filter((d) => d.isWorkingDay)
  return `${working.length} hari kerja`
}

onMounted(() => void workPatternService.fetchPatterns())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Pola Kerja
          </CardTitle>
          <CardDescription class="mt-1">
            Mengubah pola tidak mengubah hari yang sudah tercatat — setiap hari
            menyimpan pola yang menilainya.
          </CardDescription>
        </div>
        <Button @click="startNew">
          <Plus class="mr-2 h-4 w-4" />
          Pola Baru
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
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
              {{ summarise(pattern) }} · toleransi
              {{ pattern.graceMinutes }} menit
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
    </Card>
  </div>
</template>
