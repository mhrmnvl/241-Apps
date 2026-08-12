<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { DataTable, DatePicker } from '@/ui'
import { Button } from '@/ui/button'
import { AlertTriangle, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import CorrectionDialog from '../components/CorrectionDialog.vue'
import ManualEntryDialog from '../components/ManualEntryDialog.vue'
import { createColumns } from '../components/columns'
import { employeeAttendanceService } from '../services/employeeAttendanceService'
import { useEmployeeAttendanceStore } from '../stores/employeeAttendanceStore'
import type { DailyPresence } from '../types'

const store = useEmployeeAttendanceStore()
const correctionOpen = ref(false)
const manualOpen = ref(false)
const selected = ref<DailyPresence | null>(null)

function openCorrection(day: DailyPresence) {
  selected.value = day
  correctionOpen.value = true
}

const tableColumns = createColumns(openCorrection)

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
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kehadiran Pegawai
        </CardTitle>
        <Button @click="manualOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          Catat Manual
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <DatePicker
            v-model="store.selectedDate"
            class="w-[180px]"
          />
        </div>

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

        <DataTable
          :columns="tableColumns"
          :data="store.days"
          :is-loading="store.loading"
          item-label="kehadiran pegawai"
        />

        <CorrectionDialog
          v-model:open="correctionOpen"
          :record="selected"
        />
        <ManualEntryDialog v-model:open="manualOpen" />
      </div>
    </Card>
  </div>
</template>
