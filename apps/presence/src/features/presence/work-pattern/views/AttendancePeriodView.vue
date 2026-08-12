<script setup lang="ts">
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { AlertTriangle } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { createAttendancePeriodColumns } from '../components/attendancePeriodColumns'
import {
  blockingRecords,
  loading,
  periods,
  workPatternService,
} from '../services/workPatternService'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const year = ref(currentYear)

const selectedYear = computed({
  get: () => String(year.value),
  set: (val: string) => {
    year.value = Number(val)
  },
})

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

async function handleClosePeriod(month: number) {
  await workPatternService.closePeriod(year.value, month)
}

const tableColumns = computed(() =>
  createAttendancePeriodColumns((month) => void handleClosePeriod(month)),
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
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Periode Kehadiran
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <Select v-model="selectedYear">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="y in YEAR_OPTIONS"
                :key="y"
                :value="String(y)"
              >
                {{ y }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          v-if="blockingRecords.length > 0"
          class="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <div class="flex items-start gap-2 font-medium">
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Periode belum bisa ditutup — catatan berikut belum punya jam
              pulang. Perbaiki dulu di Kehadiran Pegawai.
            </p>
          </div>
          <ul class="ml-6 list-disc text-xs space-y-0.5">
            <li
              v-for="record in blockingRecords"
              :key="record.userId + record.date"
            >
              {{ record.displayName ?? record.userId }} — {{ record.date }}
            </li>
          </ul>
        </div>

        <DataTable
          :columns="tableColumns"
          :data="rows"
          :is-loading="loading"
          :page-size="12"
          hide-pagination
          hide-per-page
          item-label="periode kehadiran"
        />
      </div>
    </Card>
  </div>
</template>
