<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEventData } from '../types'
import { useCalendarFormat } from '../composables/useCalendarFormat'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Pencil } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    open: boolean
    event: CalendarEventData | null
    canManage?: boolean
  }>(),
  {
    canManage: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [event: CalendarEventData]
}>()

const { formatHourRange, formatLongDate, formatEventType } = useCalendarFormat()

const eventTypeLabel = computed(() => {
  if (!props.event) return 'Agenda'
  if (props.event.type?.name) return props.event.type.name
  if (props.event.typeId) return formatEventType(props.event.typeId)
  return 'Agenda'
})

/** One date when the entry is a day, a span when it runs across several. */
const dateRangeLabel = computed(() => {
  if (!props.event) return '-'
  const start = props.event.startDate
    ? formatLongDate(props.event.startDate)
    : ''
  const end = props.event.endDate ? formatLongDate(props.event.endDate) : ''
  if (!start && !end) return '-'
  if (!end || start === end) return start
  return `${start} – ${end}`
})

const timeRangeLabel = computed(() => {
  if (!props.event) return null
  return formatHourRange(props.event.startTime, props.event.endTime)
})

function handleEdit() {
  if (props.event) {
    emit('edit', props.event)
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="(val) => emit('update:open', val)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <!-- Header: Judul dialog -->
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle>Detail Agenda</DialogTitle>
      </DialogHeader>

      <!-- Content: Tata letak stabil menggunakan flex row dengan line-height yang sama persis untuk mencegah pergeseran teks -->
      <div class="px-6 py-5 space-y-3.5 text-xs">
        <!-- Nama Kegiatan -->
        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Nama Kegiatan</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-semibold text-foreground break-words leading-5"
          >
            {{ event?.title || '-' }}
          </span>
        </div>

        <!-- Kategori -->
        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Kategori</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ eventTypeLabel }}
          </span>
        </div>

        <!-- Tanggal Kegiatan -->
        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Tanggal Kegiatan</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ dateRangeLabel }}
          </span>
        </div>

        <!-- Waktu Kegiatan -->
        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Waktu Kegiatan</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ timeRangeLabel ? `${timeRangeLabel} WIB` : 'Sepanjang hari' }}
          </span>
        </div>

        <!-- Deskripsi -->
        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Deskripsi</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5 whitespace-pre-wrap"
          >
            {{ event?.description || '-' }}
          </span>
        </div>
      </div>

      <!-- Footer: Aksi Edit Agenda (jika memiliki izin akses) -->
      <DialogFooter
        v-if="canManage"
        class="px-6 py-4 border-t shrink-0 flex flex-row items-center justify-end"
      >
        <Button
          size="sm"
          @click="handleEdit"
        >
          <Pencil class="size-3.5 mr-1.5" />
          Edit Agenda
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
