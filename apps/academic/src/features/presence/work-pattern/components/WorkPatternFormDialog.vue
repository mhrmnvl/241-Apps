<script setup lang="ts">
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Switch } from '@/ui/switch'
import { ref, watch } from 'vue'
import { workPatternService } from '../services/workPatternService'
import { WEEKDAY_LABEL, defaultWeek } from '../types'
import type { WorkPattern, WorkPatternDay } from '../types'

const props = defineProps<{
  open: boolean
  editing: WorkPattern | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const name = ref('')
const graceMinutes = ref(15)
const isDefault = ref(false)
const days = ref<WorkPatternDay[]>(defaultWeek())
const saving = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    if (props.editing) {
      name.value = props.editing.name
      graceMinutes.value = props.editing.graceMinutes
      isDefault.value = props.editing.isDefault
      days.value = props.editing.days.map((d) => ({
        weekday: d.weekday,
        isWorkingDay: d.isWorkingDay,
        startTime: d.startTime ?? '07:00',
        endTime: d.endTime ?? '15:00',
      }))
    } else {
      name.value = ''
      graceMinutes.value = 15
      isDefault.value = false
      days.value = defaultWeek()
    }
  },
  { immediate: true },
)

async function handleSave() {
  if (!name.value) return

  saving.value = true
  await workPatternService.savePattern(
    {
      ...(props.editing ? { id: props.editing.id } : {}),
      name: name.value,
      graceMinutes: graceMinutes.value,
      isDefault: isDefault.value,
    },
    days.value,
  )
  saving.value = false
  emit('success')
  emit('update:open', false)
}

async function handleDelete() {
  if (!props.editing) return
  const confirmed = window.confirm(`Hapus pola kerja "${props.editing.name}"?`)
  if (!confirmed) return

  saving.value = true
  await workPatternService.deletePattern(props.editing.id)
  saving.value = false
  emit('success')
  emit('update:open', false)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-xl flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{ editing ? 'Ubah Pola Kerja' : 'Tambah Pola Kerja Baru' }}
        </DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <div class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="pattern-name">Nama Pola Kerja</Label>
            <Input
              id="pattern-name"
              v-model="name"
              placeholder="Mis. Reguler / Shift Pagi"
            />
          </div>

          <div class="space-y-1.5">
            <Label for="pattern-grace">Toleransi Keterlambatan (menit)</Label>
            <Input
              id="pattern-grace"
              v-model.number="graceMinutes"
              type="number"
              min="0"
              max="120"
            />
          </div>
        </div>

        <div
          class="flex items-center justify-between rounded-lg border p-3 cursor-pointer select-none hover:bg-accent/50 transition-colors"
          @click="isDefault = !isDefault"
        >
          <span class="text-sm font-medium">Jadikan Pola Kerja Default</span>
          <Switch
            :model-value="isDefault"
            class="pointer-events-none"
          />
        </div>

        <div class="space-y-3">
          <Label class="text-sm font-medium">Pengaturan Jam Kerja Hari</Label>
          <div class="space-y-2">
            <div
              v-for="day in days"
              :key="day.weekday"
              class="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div
                class="flex items-center gap-3 cursor-pointer select-none"
                @click="day.isWorkingDay = !day.isWorkingDay"
              >
                <Switch
                  :model-value="day.isWorkingDay"
                  class="pointer-events-none"
                />
                <span class="w-16 font-medium">
                  {{ WEEKDAY_LABEL[day.weekday] }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <Input
                  v-model="day.startTime"
                  type="time"
                  class="w-28 text-center"
                  :disabled="!day.isWorkingDay"
                />
                <span class="text-muted-foreground">—</span>
                <Input
                  v-model="day.endTime"
                  type="time"
                  class="w-28 text-center"
                  :disabled="!day.isWorkingDay"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter
        class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-between shrink-0"
      >
        <div>
          <Button
            v-if="editing && !editing.isDefault"
            type="button"
            variant="destructive"
            :disabled="saving"
            @click="handleDelete"
          >
            Hapus
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
          >
            Batal
          </Button>
          <Button
            type="button"
            :disabled="saving || !name"
            @click="handleSave"
          >
            Simpan
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
