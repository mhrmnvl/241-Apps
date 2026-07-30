<script setup lang="ts">
import AttendanceSummaryCards from './AttendanceSummaryCards.vue'
import AttendanceTrendChart from './AttendanceTrendChart.vue'
import { createRecapColumns } from './columns'
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
