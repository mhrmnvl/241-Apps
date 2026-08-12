<script setup lang="ts">
import { lookupService } from '@/features/lookup'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { AppCombobox, DatePicker } from '@/ui'
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
import type { PresenceDayStatus } from '../types'

const open = defineModel<boolean>('open', { required: true })

const store = useEmployeeAttendanceStore()

const userId = ref('')
const selectedDate = ref('')
const status = ref<PresenceDayStatus>('PRESENT')
const checkInAt = ref('')
const checkOutAt = ref('')
const note = ref('')
const reason = ref('')

const loadingEmployees = ref(false)
const employeeOptions = ref<{ label: string; value: string }[]>([])

async function loadEmployees() {
  if (employeeOptions.value.length > 0) return
  loadingEmployees.value = true
  try {
    const employees = await lookupService.listEmployees()
    employeeOptions.value = employees.map((employee) => ({
      label: `${employee.name} (${employee.identifier})`,
      value: employee.userId,
    }))
  } catch (err) {
    toast.error(getIndonesianErrorMessage(err, 'Gagal memuat daftar pegawai.'))
  } finally {
    loadingEmployees.value = false
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    selectedDate.value = store.selectedDate
    void loadEmployees()
  } else {
    userId.value = ''
    selectedDate.value = ''
    status.value = 'PRESENT'
    checkInAt.value = ''
    checkOutAt.value = ''
    note.value = ''
    reason.value = ''
  }
})

function toInstant(time: string) {
  return time
    ? new Date(`${selectedDate.value}T${time}:00.000Z`).toISOString()
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
    date: selectedDate.value,
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
    <DialogContent class="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>Catat Kehadiran Manual</DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div class="space-y-1">
          <Label for="manual-user">
            Pegawai <span class="text-red-500">*</span>
          </Label>
          <AppCombobox
            v-model="userId"
            :options="employeeOptions"
            placeholder="Pilih Pegawai"
            search-placeholder="Cari nama atau NIP pegawai..."
            empty-text="Pegawai tidak ditemukan."
            :disabled="loadingEmployees"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label>Tanggal</Label>
            <DatePicker v-model="selectedDate" />
          </div>

          <div class="space-y-1">
            <Label for="manual-status">Status</Label>
            <Select v-model="status">
              <SelectTrigger
                id="manual-status"
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
