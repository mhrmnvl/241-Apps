<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import type { Attendance, AttendanceStatus } from '../types'

const props = defineProps<{
  open: boolean
  date: Date | string | null
  attendances: Attendance[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  SICK: 'Sakit',
  EXCUSED: 'Izin',
  ABSENT: 'Alpa',
}

const dayName = computed(() => {
  if (!props.date) return '-'
  const d = new Date(props.date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { weekday: 'long' })
})

const formattedDate = computed(() => {
  if (!props.date) return '-'
  const d = new Date(props.date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="(val) => emit('update:open', val)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <!-- Header: Judul dialog -->
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle class="text-base font-bold">Detail Kehadiran</DialogTitle>
      </DialogHeader>

      <!-- Content: Tata letak stabil sejajar menggunakan flex row dengan line-height yang sama persis -->
      <div class="px-6 py-5 space-y-3.5 text-xs">
        <!-- Hari -->
        <div class="flex items-start gap-2">
          <span class="w-[90px] shrink-0 font-medium text-foreground leading-5">
            Hari
          </span>
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-semibold text-foreground break-words leading-5"
          >
            {{ dayName }}
          </span>
        </div>

        <!-- Tanggal -->
        <div class="flex items-start gap-2">
          <span class="w-[90px] shrink-0 font-medium text-foreground leading-5">
            Tanggal
          </span>
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ formattedDate }}
          </span>
        </div>

        <!-- Kehadiran -->
        <div class="flex items-start gap-2">
          <span class="w-[90px] shrink-0 font-medium text-foreground leading-5">
            Kehadiran
          </span>
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <div class="flex-1 min-w-0 leading-5 text-foreground">
            <template v-if="attendances.length === 1">
              <span class="font-medium">
                {{
                  STATUS_LABEL[attendances[0].status] ?? attendances[0].status
                }}
              </span>
              <span
                v-if="attendances[0].schedule?.timeSlot?.name"
                class="text-muted-foreground text-xs ml-1.5"
              >
                ({{ attendances[0].schedule.timeSlot.name }})
              </span>
            </template>
            <template v-else-if="attendances.length > 1">
              <div class="space-y-1.5 w-full">
                <div
                  v-for="(att, idx) in attendances"
                  :key="att.id ?? idx"
                  class="flex items-center gap-1.5"
                >
                  <span class="font-medium">
                    {{ STATUS_LABEL[att.status] ?? att.status }}
                  </span>
                  <span
                    v-if="att.schedule?.timeSlot?.name"
                    class="text-muted-foreground text-xs"
                  >
                    ({{ att.schedule.timeSlot.name }})
                  </span>
                </div>
              </div>
            </template>
            <span
              v-else
              class="text-muted-foreground"
              >-</span
            >
          </div>
        </div>

        <!-- Catatan -->
        <div class="flex items-start gap-2">
          <span class="w-[90px] shrink-0 font-medium text-foreground leading-5">
            Catatan
          </span>
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <div class="flex-1 min-w-0 leading-5 text-foreground">
            <template v-if="attendances.length === 1">
              <span class="break-words font-medium">
                {{ attendances[0].note || '-' }}
              </span>
            </template>
            <template v-else-if="attendances.length > 1">
              <div class="space-y-1">
                <div
                  v-for="(att, idx) in attendances"
                  :key="att.id ?? idx"
                  class="text-xs"
                >
                  <span
                    v-if="att.schedule?.timeSlot?.name"
                    class="text-muted-foreground font-medium"
                  >
                    {{ att.schedule.timeSlot.name }}:
                  </span>
                  <span class="ml-1 text-foreground">
                    {{ att.note || '-' }}
                  </span>
                </div>
              </div>
            </template>
            <span
              v-else
              class="text-muted-foreground"
              >-</span
            >
          </div>
        </div>
      </div>

      <!-- Footer: Tombol aksi -->
      <DialogFooter
        class="px-6 py-3 border-t bg-muted/20 flex justify-end gap-2 shrink-0"
      >
        <Button
          variant="outline"
          size="sm"
          @click="emit('update:open', false)"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
