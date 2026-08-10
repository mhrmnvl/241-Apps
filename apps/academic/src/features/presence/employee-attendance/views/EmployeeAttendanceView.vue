<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { AlertTriangle, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import CorrectionDialog from '../components/CorrectionDialog.vue'
import CorrectionTrailPopover from '../components/CorrectionTrailPopover.vue'
import ManualEntryDialog from '../components/ManualEntryDialog.vue'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import { DAY_STATUS_LABEL, hasLeaveConflict, isAnomalousDay } from '../types'
import type { DailyPresence, PresenceDayStatus } from '../types'

const store = useEmployeeAttendanceStore()
const correctionOpen = ref(false)
const manualOpen = ref(false)
const selected = ref<DailyPresence | null>(null)

const STATUS_VARIANT: Record<PresenceDayStatus, string> = {
  PRESENT: 'default',
  LATE: 'secondary',
  ABSENT: 'destructive',
  ON_LEAVE: 'outline',
  OFFICIAL_DUTY: 'outline',
  NOT_EXPECTED: 'outline',
}

function time(value: string | null) {
  return value ? new Date(value).toISOString().slice(11, 16) : '—'
}

function openCorrection(day: DailyPresence) {
  selected.value = day
  correctionOpen.value = true
}

watch(
  () => [store.selectedDate, store.statusFilter],
  () => void employeeAttendanceService.fetchDay(),
)

onMounted(() => void employeeAttendanceService.fetchDay())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Kehadiran Pegawai</h1>
        <p class="text-muted-foreground text-sm">
          Setiap koreksi tercatat beserta alasannya. Anda tidak dapat mengubah
          catatan Anda sendiri.
        </p>
      </div>
      <div class="flex items-end gap-2">
        <Input
          v-model="store.selectedDate"
          type="date"
          class="w-44"
        />
        <Button
          variant="outline"
          @click="manualOpen = true"
        >
          <Plus class="mr-2 h-4 w-4" />
          Catat Manual
        </Button>
      </div>
    </div>

    <!-- Anomalies first: these are the rows TU has to act on, and they are
         invisible in a list sorted by name. -->
    <div
      v-if="store.anomalies.length > 0"
      class="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {{ store.anomalies.length }} catatan perlu diperiksa — ada yang tidak
        tap pulang, atau tap pulang tanpa tap masuk.
      </p>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Masuk</TableHead>
          <TableHead>Pulang</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Terlambat</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="day in store.days"
          :key="day.id"
          :class="
            isAnomalousDay(day) ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
          "
        >
          <TableCell>
            <p>{{ day.holder.displayName ?? '—' }}</p>
            <p class="text-muted-foreground font-mono text-xs">
              {{ day.holder.identifier }}
            </p>
          </TableCell>
          <TableCell>
            {{ time(day.checkInAt) }}
            <!-- FR-014: scanned or entered by hand, visible wherever shown. -->
            <span
              v-if="day.checkInSource === 'MANUAL'"
              class="text-muted-foreground ml-1 text-xs"
            >
              (manual)
            </span>
          </TableCell>
          <TableCell>
            {{ time(day.checkOutAt) }}
            <span
              v-if="day.checkOutSource === 'MANUAL'"
              class="text-muted-foreground ml-1 text-xs"
            >
              (manual)
            </span>
          </TableCell>
          <TableCell>
            <Badge :variant="STATUS_VARIANT[day.status] as 'default'">
              {{ DAY_STATUS_LABEL[day.status] }}
            </Badge>
            <!-- Scanned on an approved-leave day: the scan is kept, the status
                 is not overwritten, and the clash is stated rather than hidden. -->
            <Badge
              v-if="hasLeaveConflict(day)"
              variant="outline"
              class="ml-1"
              title="Ada scan di hari izin yang sudah disetujui — perlu diperiksa."
            >
              Bentrok izin
            </Badge>
          </TableCell>
          <TableCell>
            {{ day.lateMinutes > 0 ? `${day.lateMinutes} mnt` : '—' }}
          </TableCell>
          <TableCell class="space-x-1 text-right">
            <CorrectionTrailPopover
              v-if="day.corrected"
              :record-id="day.id"
            />
            <Button
              variant="ghost"
              size="sm"
              @click="openCorrection(day)"
            >
              Koreksi
            </Button>
          </TableCell>
        </TableRow>

        <TableRow v-if="!store.loading && store.days.length === 0">
          <TableCell
            colspan="6"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada catatan kehadiran untuk tanggal ini.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <CorrectionDialog
      v-model:open="correctionOpen"
      :record="selected"
    />
    <ManualEntryDialog v-model:open="manualOpen" />
  </div>
</template>
