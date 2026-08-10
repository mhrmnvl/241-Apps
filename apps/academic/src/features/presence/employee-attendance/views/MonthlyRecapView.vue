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
import { Download } from 'lucide-vue-next'
import { onMounted, watch } from 'vue'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'

const store = useEmployeeAttendanceStore()

watch(
  () => [store.recapYear, store.recapMonth],
  () => void employeeAttendanceService.fetchRecap(),
)

onMounted(() => void employeeAttendanceService.fetchRecap())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Rekap Kehadiran Bulanan</h1>
        <p class="text-muted-foreground text-sm">
          Persentase dihitung dari hari hadir dibagi hari yang diharapkan — cuti
          dan hari libur tidak menurunkannya.
        </p>
      </div>
      <div class="flex items-end gap-2">
        <Input
          v-model.number="store.recapMonth"
          type="number"
          min="1"
          max="12"
          class="w-20"
        />
        <Input
          v-model.number="store.recapYear"
          type="number"
          min="2000"
          max="2100"
          class="w-24"
        />
        <Button
          variant="outline"
          @click="employeeAttendanceService.exportRecap()"
        >
          <Download class="mr-2 h-4 w-4" />
          Ekspor
        </Button>
      </div>
    </div>

    <div
      v-if="store.recap"
      class="text-muted-foreground flex items-center gap-3 text-sm"
    >
      <span>{{ store.recap.period.workingDays }} hari kerja</span>
      <Badge
        :variant="
          store.recap.period.status === 'CLOSED' ? 'secondary' : 'outline'
        "
      >
        {{
          store.recap.period.status === 'CLOSED'
            ? 'Periode ditutup'
            : 'Periode terbuka'
        }}
      </Badge>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead class="text-right">Hadir</TableHead>
          <TableHead class="text-right">Alpa</TableHead>
          <TableHead class="text-right">Terlambat</TableHead>
          <TableHead class="text-right">Menit</TableHead>
          <TableHead class="text-right">Pulang cepat</TableHead>
          <TableHead class="text-right">Izin</TableHead>
          <TableHead class="text-right">Dinas</TableHead>
          <TableHead class="text-right">%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="row in store.recap?.rows ?? []"
          :key="row.userId"
        >
          <TableCell>{{ row.displayName ?? '—' }}</TableCell>
          <TableCell class="text-right">{{ row.presentDays }}</TableCell>
          <TableCell
            class="text-right"
            :class="row.absentDays > 0 ? 'text-red-600 font-medium' : ''"
          >
            {{ row.absentDays }}
          </TableCell>
          <TableCell class="text-right">{{ row.lateCount }}</TableCell>
          <TableCell class="text-right">{{ row.lateMinutes }}</TableCell>
          <TableCell class="text-right">{{ row.earlyLeaveCount }}</TableCell>
          <TableCell class="text-right">{{ row.leaveDays }}</TableCell>
          <TableCell class="text-right">{{ row.officialDutyDays }}</TableCell>
          <TableCell class="text-right font-medium">
            {{ row.attendanceRate }}%
          </TableCell>
        </TableRow>

        <TableRow
          v-if="!store.loading && (store.recap?.rows.length ?? 0) === 0"
        >
          <TableCell
            colspan="9"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada pegawai berkartu aktif untuk periode ini.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
