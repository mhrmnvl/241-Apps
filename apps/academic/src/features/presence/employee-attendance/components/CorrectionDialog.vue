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
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          Koreksi Kehadiran — {{ record?.holder.displayName ?? '—' }}
        </DialogTitle>
        <DialogDescription>
          Setiap perubahan tercatat beserta nilai sebelumnya, siapa yang
          mengubah, dan alasannya. Anda tidak dapat mengoreksi catatan Anda
          sendiri.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
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
          <select
            id="correction-status"
            v-model="status"
            class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option
              v-for="(label, value) in DAY_STATUS_LABEL"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
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

      <DialogFooter>
        <Button
          variant="outline"
          @click="open = false"
          >Batal</Button
        >
        <Button
          :disabled="store.isSaving"
          @click="submit"
          >Simpan</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
