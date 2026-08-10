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
import { AlertTriangle, Lock } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import {
  blockingRecords,
  periods,
  workPatternService,
} from '../services/workPatternService'

const year = ref(new Date().getFullYear())

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

/** A month with no row has never been closed, so it is open. */
const rows = computed(() =>
  MONTHS.map((label, index) => {
    const month = index + 1
    const period = periods.value.find(
      (p) => p.year === year.value && p.month === month,
    )
    return {
      month,
      label,
      status: period?.status ?? 'OPEN',
    }
  }),
)

watch(year, () => void workPatternService.fetchPeriods(year.value))
onMounted(() => void workPatternService.fetchPeriods(year.value))
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Periode Kehadiran</h1>
        <p class="text-muted-foreground text-sm">
          Menutup bulan mengunci angkanya. Penggajian menolak berjalan atas
          periode terbuka, dan koreksi ditolak setelah ditutup.
        </p>
      </div>
      <Input
        v-model.number="year"
        type="number"
        min="2000"
        max="2100"
        class="w-28"
      />
    </div>

    <!-- The refusal carries the records that blocked it. Showing them is the
         difference between "gagal" and "ini yang harus diperbaiki". -->
    <div
      v-if="blockingRecords.length > 0"
      class="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      <div class="flex items-start gap-2">
        <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Periode belum bisa ditutup — catatan berikut belum punya jam pulang.
          Perbaiki dulu di Kehadiran Pegawai.
        </p>
      </div>
      <ul class="ml-6 list-disc">
        <li
          v-for="record in blockingRecords"
          :key="record.userId + record.date"
        >
          {{ record.displayName ?? record.userId }} — {{ record.date }}
        </li>
      </ul>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bulan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="row in rows"
          :key="row.month"
        >
          <TableCell>{{ row.label }}</TableCell>
          <TableCell>
            <Badge :variant="row.status === 'CLOSED' ? 'secondary' : 'outline'">
              {{ row.status === 'CLOSED' ? 'Ditutup' : 'Terbuka' }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <Button
              v-if="row.status === 'OPEN'"
              variant="ghost"
              size="sm"
              @click="workPatternService.closePeriod(year, row.month)"
            >
              <Lock class="mr-1 h-3.5 w-3.5" />
              Tutup
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
