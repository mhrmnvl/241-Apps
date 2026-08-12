<script setup lang="ts">
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { CheckCircle2, Clock, Timer, XCircle } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { myAttendanceColumns } from '../components/myAttendanceColumns'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'

const store = useEmployeeAttendanceStore()

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
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kehadiran Saya
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl border bg-card p-4 shadow-sm">
            <div
              class="text-muted-foreground flex items-center justify-between text-xs font-medium"
            >
              <span>Hadir</span>
              <CheckCircle2
                class="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <p class="text-foreground mt-2 text-2xl font-bold tracking-tight">
              {{ totals.present }}
            </p>
          </div>

          <div class="rounded-xl border bg-card p-4 shadow-sm">
            <div
              class="text-muted-foreground flex items-center justify-between text-xs font-medium"
            >
              <span>Terlambat</span>
              <Clock class="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p class="text-foreground mt-2 text-2xl font-bold tracking-tight">
              {{ totals.late }}
            </p>
          </div>

          <div class="rounded-xl border bg-card p-4 shadow-sm">
            <div
              class="text-muted-foreground flex items-center justify-between text-xs font-medium"
            >
              <span>Alpa</span>
              <XCircle class="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p class="text-foreground mt-2 text-2xl font-bold tracking-tight">
              {{ totals.absent }}
            </p>
          </div>

          <div class="rounded-xl border bg-card p-4 shadow-sm">
            <div
              class="text-muted-foreground flex items-center justify-between text-xs font-medium"
            >
              <span>Total Menit Terlambat</span>
              <Timer class="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p class="text-foreground mt-2 text-2xl font-bold tracking-tight">
              {{ totals.lateMinutes }}
            </p>
          </div>
        </div>

        <DataTable
          :columns="myAttendanceColumns"
          :data="store.mine?.days ?? []"
          :is-loading="store.loading"
          item-label="catatan kehadiran saya"
        />
      </div>
    </Card>
  </div>
</template>
