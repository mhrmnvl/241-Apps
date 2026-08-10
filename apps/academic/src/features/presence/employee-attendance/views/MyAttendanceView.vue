<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { computed, onMounted } from 'vue'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import { DAY_STATUS_LABEL } from '../types'

const store = useEmployeeAttendanceStore()

function time(value: string | null) {
  return value ? new Date(value).toISOString().slice(11, 16) : '—'
}

function day(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const totals = computed(() => {
  const days = store.mine?.days ?? []
  return {
    present: days.filter((d) => d.status === 'PRESENT' || d.status === 'LATE')
      .length,
    late: days.filter((d) => d.status === 'LATE').length,
    absent: days.filter((d) => d.status === 'ABSENT').length,
    lateMinutes: days.reduce((sum, d) => sum + d.lateMinutes, 0),
  }
})

onMounted(() => void employeeAttendanceService.fetchMine())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="border-b px-6 py-5">
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kehadiran Saya
        </CardTitle>
        <CardDescription class="mt-1">
          Kalau ada tanggal yang salah atau tidak tercatat, laporkan ke TU
          secepatnya — mengoreksinya jauh lebih mudah sebelum bulan ditutup.
        </CardDescription>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-lg border p-4">
            <p class="text-muted-foreground text-xs">Hadir</p>
            <p class="text-2xl font-semibold">{{ totals.present }}</p>
          </div>
          <div class="rounded-lg border p-4">
            <p class="text-muted-foreground text-xs">Terlambat</p>
            <p class="text-2xl font-semibold">{{ totals.late }}</p>
          </div>
          <div class="rounded-lg border p-4">
            <p class="text-muted-foreground text-xs">Alpa</p>
            <p class="text-2xl font-semibold">{{ totals.absent }}</p>
          </div>
          <div class="rounded-lg border p-4">
            <p class="text-muted-foreground text-xs">Total menit terlambat</p>
            <p class="text-2xl font-semibold">{{ totals.lateMinutes }}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Masuk</TableHead>
              <TableHead>Pulang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Terlambat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="record in store.mine?.days ?? []"
              :key="record.id"
            >
              <TableCell>{{ day(record.date) }}</TableCell>
              <TableCell>{{ time(record.checkInAt) }}</TableCell>
              <TableCell>{{ time(record.checkOutAt) }}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {{ DAY_STATUS_LABEL[record.status] }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                {{ record.lateMinutes > 0 ? `${record.lateMinutes} mnt` : '—' }}
              </TableCell>
            </TableRow>

            <TableRow
              v-if="!store.loading && (store.mine?.days.length ?? 0) === 0"
            >
              <TableCell
                colspan="5"
                class="text-muted-foreground py-10 text-center"
              >
                Belum ada catatan kehadiran bulan ini.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>
