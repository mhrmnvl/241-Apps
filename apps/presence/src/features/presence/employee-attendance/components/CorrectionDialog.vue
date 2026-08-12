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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Textarea } from '@/ui/textarea'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import { DAY_STATUS_LABEL } from '../types'
import type { DailyPresence, PresenceDayStatus } from '../types'

const props = defineProps<{ record: DailyPresence | null }>()
const open = defineModel<boolean>('open', { required: true })

const store = useEmployeeAttendanceStore()

const status = ref<PresenceDayStatus | ''>('')
const checkInAt = ref('')
const checkOutAt = ref('')
const note = ref('')
const reason = ref('')

/** "2026-08-10T07:05:00.000Z" → "07:05" for a time input. */
function toTimeInput(value: string | null) {
  return value ? new Date(value).toISOString().slice(11, 16) : ''
}

/** Back to an instant on the record's own date, not today's. */
function toInstant(time: string, date: string) {
  return time ? new Date(`${date}T${time}:00.000Z`).toISOString() : null
}

watch(
  () => props.record,
  (record) => {
    status.value = record?.status ?? ''
    checkInAt.value = toTimeInput(record?.checkInAt ?? null)
    checkOutAt.value = toTimeInput(record?.checkOutAt ?? null)
    note.value = record?.note ?? ''
    reason.value = ''
  },
  { immediate: true },
)

async function submit() {
  if (!props.record) return

  if (reason.value.trim().length < 3) {
    toast.error('Alasan koreksi wajib diisi.')
    return
  }

  const date = props.record.date.slice(0, 10)
  const ok = await employeeAttendanceService.correct(props.record.id, {
    reason: reason.value.trim(),
    ...(status.value !== props.record.status && {
      status: status.value as PresenceDayStatus,
    }),
    ...(toInstant(checkInAt.value, date) !== props.record.checkInAt && {
      checkInAt: toInstant(checkInAt.value, date),
    }),
    ...(toInstant(checkOutAt.value, date) !== props.record.checkOutAt && {
      checkOutAt: toInstant(checkOutAt.value, date),
    }),
    ...(note.value !== (props.record.note ?? '') && {
      note: note.value || null,
    }),
  })

  if (ok) open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>Koreksi Kehadiran</DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div class="space-y-1">
          <Label>Pegawai</Label>
          <Input
            :model-value="record?.holder.displayName ?? '—'"
            disabled
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label for="correction-in">Jam masuk</Label>
            <Input
              id="correction-in"
              v-model="checkInAt"
              type="time"
            />
          </div>
          <div class="space-y-1">
            <Label for="correction-out">Jam pulang</Label>
            <Input
              id="correction-out"
              v-model="checkOutAt"
              type="time"
            />
          </div>
        </div>

        <div class="space-y-1">
          <Label for="correction-status">Status</Label>
          <Select v-model="status">
            <SelectTrigger
              id="correction-status"
              class="w-full"
            >
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="(label, value) in DAY_STATUS_LABEL"
                :key="value"
                :value="value"
              >
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1">
          <Label for="correction-note">Catatan</Label>
          <Input
            id="correction-note"
            v-model="note"
          />
        </div>

        <!-- Required, not an optional note. A correction with no stated reason
             is distinguishable from tampering only by trust (FR-013). -->
        <div class="space-y-1">
          <Label for="correction-reason">
            Alasan koreksi <span class="text-red-500">*</span>
          </Label>
          <Textarea
            id="correction-reason"
            v-model="reason"
            rows="2"
            placeholder="Mis. lupa tap kartu, hadir sesuai jadwal piket"
          />
        </div>
      </div>

      <DialogFooter
        class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0"
      >
        <Button
          variant="outline"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          :disabled="store.isSaving"
          @click="submit"
        >
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
