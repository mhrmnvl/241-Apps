<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
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
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Kehadiran Pegawai
          </CardTitle>
          <CardDescription class="mt-1">
            Setiap koreksi tercatat beserta alasannya. Anda tidak dapat mengubah
            catatan Anda sendiri.
          </CardDescription>
        </div>
        <div class="flex items-center gap-2">
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
      </CardHeader>

      <div class="p-6 space-y-4">
        <!-- Anomalies first: these are the rows TU has to act on, and they are
             invisible in a list sorted by name. -->
        <div
          v-if="store.anomalies.length > 0"
          class="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {{ store.anomalies.length }} catatan perlu diperiksa — ada yang
            tidak tap pulang, atau tap pulang tanpa tap masuk.
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
            >
              <TableCell>
                <div class="font-medium">
                  {{ day.holder.displayName ?? '—' }}
                </div>
                <div class="text-muted-foreground text-xs">
                  {{ day.holder.identifier }}
                </div>
              </TableCell>
              <TableCell>{{ time(day.checkInAt) }}</TableCell>
              <TableCell>{{ time(day.checkOutAt) }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-1.5">
                  <Badge :variant="STATUS_VARIANT[day.status] as any">
                    {{ DAY_STATUS_LABEL[day.status] }}
                  </Badge>

                  <Badge
                    v-if="isAnomalousDay(day)"
                    variant="outline"
                    class="border-amber-400 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                  >
                    Anomali
                  </Badge>

                  <Badge
                    v-if="hasLeaveConflict(day)"
                    variant="outline"
                    class="border-purple-400 text-purple-700 dark:border-purple-800 dark:text-purple-300"
                  >
                    Cuti Bersamaan
                  </Badge>
                </div>
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
    </Card>
  </div>
</template>
