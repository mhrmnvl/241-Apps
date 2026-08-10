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
import { AlertTriangle, Lock } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import {
  blockingRecords,
  periods,
  workPatternService,
} from '../services/workPatternService'

const year = ref(new Date().getFullYear())

const MONTH_NAMES = [
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

const rows = computed(() =>
  MONTH_NAMES.map((label, index) => {
    const month = index + 1
    const period = periods.value.find((p) => p.month === month)
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
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Periode Kehadiran
          </CardTitle>
          <CardDescription class="mt-1">
            Menutup bulan mengunci angkanya. Penggajian menolak berjalan atas
            periode terbuka, dan koreksi ditolak setelah ditutup.
          </CardDescription>
        </div>
        <Input
          v-model.number="year"
          type="number"
          min="2000"
          max="2100"
          class="w-28"
        />
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- The refusal carries the records that blocked it. Showing them is the
             difference between "gagal" and "ini yang harus diperbaiki". -->
        <div
          v-if="blockingRecords.length > 0"
          class="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <div class="flex items-start gap-2">
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Periode belum bisa ditutup — catatan berikut belum punya jam
              pulang. Perbaiki dulu di Kehadiran Pegawai.
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
                <Badge
                  :variant="row.status === 'CLOSED' ? 'secondary' : 'outline'"
                >
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
    </Card>
  </div>
</template>
