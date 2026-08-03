<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import AttendanceSummaryCards from './AttendanceSummaryCards.vue'
import { createRecapColumns } from './columns'

// Split out: the chart pulls in the whole @unovis/ts runtime (~600 kB), which
// otherwise lands in the Attendance route chunk even though the chart only
// renders once the Recap tab is opened.
const AttendanceTrendChart = defineAsyncComponent(
  () => import('./AttendanceTrendChart.vue'),
)
import { DataTable } from '@/ui'
import type { AttendanceRecapItem, AttendanceTrendPoint } from '../types'

defineProps<{
  recapItems: AttendanceRecapItem[]
  classPercentage: number
  monthDelta: number | null
  recapLoading: boolean
  trendData: AttendanceTrendPoint[]
}>()

const recapColumns = createRecapColumns()
</script>

<template>
  <div class="space-y-6">
    <AttendanceSummaryCards
      :recap-items="recapItems"
      :class-percentage="classPercentage"
      :month-delta="monthDelta"
      :loading="recapLoading"
    />
    <AttendanceTrendChart :trend-data="trendData" />
    <DataTable
      :columns="recapColumns"
      :data="recapItems"
      :total-items="recapItems.length"
      :is-loading="recapLoading"
      item-label="siswa"
      filter-column="studentName"
      filter-placeholder="Cari nama siswa..."
    />
  </div>
</template>
