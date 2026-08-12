<script setup lang="ts">
import { Button } from '@/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { History } from 'lucide-vue-next'
import { ref } from 'vue'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import { DAY_STATUS_LABEL } from '../types'
import type { PresenceCorrection, PresenceDayStatus } from '../types'

const props = defineProps<{ recordId: string }>()

const store = useEmployeeAttendanceStore()
const open = ref(false)

const FIELD_LABEL: Record<PresenceCorrection['field'], string> = {
  checkInAt: 'Jam masuk',
  checkOutAt: 'Jam pulang',
  status: 'Status',
  note: 'Catatan',
}

/** Values are stored serialised, so a status arrives as its enum name. */
function display(field: PresenceCorrection['field'], value: string | null) {
  if (value === null) return '—'
  if (field === 'status') {
    return DAY_STATUS_LABEL[value as PresenceDayStatus] ?? value
  }
  if (field === 'checkInAt' || field === 'checkOutAt') {
    return new Date(value).toISOString().slice(11, 16)
  }
  return value
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

async function load(isOpen: boolean) {
  open.value = isOpen
  if (isOpen) await employeeAttendanceService.fetchDetail(props.recordId)
}
</script>

<template>
  <Popover
    :open="open"
    @update:open="load"
  >
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="text-amber-600"
      >
        <History class="mr-1 h-3.5 w-3.5" />
        Dikoreksi
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-96">
      <p class="mb-3 text-sm font-medium">Riwayat koreksi</p>

      <!-- Previous value, actor, timestamp and reason without a second page
           load — FR-013 and Acceptance Scenario 2.3. -->
      <ol
        v-if="store.detail?.corrections.length"
        class="space-y-3 text-sm"
      >
        <li
          v-for="correction in store.detail.corrections"
          :key="correction.id"
          class="border-l-2 pl-3"
        >
          <p class="font-medium">{{ FIELD_LABEL[correction.field] }}</p>
          <p class="text-muted-foreground">
            {{ display(correction.field, correction.previousValue) }}
            →
            <span class="text-foreground">
              {{ display(correction.field, correction.newValue) }}
            </span>
          </p>
          <p class="mt-1 italic">“{{ correction.reason }}”</p>
          <p class="text-muted-foreground text-xs">
            {{ correction.actor.displayName ?? 'Tidak diketahui' }} ·
            {{ formatWhen(correction.createdAt) }}
          </p>
        </li>
      </ol>

      <p
        v-else
        class="text-muted-foreground text-sm"
      >
        Memuat…
      </p>
    </PopoverContent>
  </Popover>
</template>
