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
import type { PresenceDayStatus } from '../types'

const open = defineModel<boolean>('open', { required: true })

const store = useEmployeeAttendanceStore()

const userId = ref('')
const status = ref<PresenceDayStatus>('PRESENT')
const checkInAt = ref('')
const checkOutAt = ref('')
const note = ref('')
const reason = ref('')

watch(open, (isOpen) => {
  if (!isOpen) {
    userId.value = ''
    status.value = 'PRESENT'
    checkInAt.value = ''
    checkOutAt.value = ''
    note.value = ''
    reason.value = ''
  }
})

function toInstant(time: string) {
  return time
    ? new Date(`${store.selectedDate}T${time}:00.000Z`).toISOString()
    : undefined
}

async function submit() {
  if (!userId.value) {
    toast.error('Pilih pegawai.')
    return
  }
  if (reason.value.trim().length < 3) {
    toast.error('Alasan wajib diisi.')
    return
  }

  const ok = await employeeAttendanceService.createManual({
    userId: userId.value,
    subjectType: 'EMPLOYEE',
    date: store.selectedDate,
    status: status.value,
    reason: reason.value.trim(),
    ...(checkInAt.value && { checkInAt: toInstant(checkInAt.value) }),
    ...(checkOutAt.value && { checkOutAt: toInstant(checkOutAt.value) }),
    ...(note.value && { note: note.value }),
  })

  if (ok) open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Catat Kehadiran Manual</DialogTitle>
        <DialogDescription>
          Untuk pegawai yang tidak sempat tap kartu. Semua nilai ditandai
          "manual", sehingga rekap selalu bisa membedakan hari yang diamati
          gerbang dari hari yang dinyatakan orang.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1">
          <Label for="manual-user">ID Pegawai</Label>
          <Input
            id="manual-user"
            v-model="userId"
            placeholder="UUID pengguna"
          />
        </div>

        <div class="space-y-1">
          <Label>Tanggal</Label>
          <Input
            :model-value="store.selectedDate"
            readonly
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label for="manual-in">Jam masuk</Label>
            <Input
              id="manual-in"
              v-model="checkInAt"
              type="time"
            />
          </div>
          <div class="space-y-1">
            <Label for="manual-out">Jam pulang</Label>
            <Input
              id="manual-out"
              v-model="checkOutAt"
              type="time"
            />
          </div>
        </div>

        <div class="space-y-1">
          <Label for="manual-status">Status</Label>
          <select
            id="manual-status"
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
          <Label for="manual-reason">
            Alasan <span class="text-red-500">*</span>
          </Label>
          <Textarea
            id="manual-reason"
            v-model="reason"
            rows="2"
            placeholder="Mis. kartu tertinggal, hadir sesuai jadwal"
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
