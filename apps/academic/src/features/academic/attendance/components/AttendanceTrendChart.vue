<script setup lang="ts">
import { computed } from 'vue'
import { LineChart, CurveType, LegendPosition } from 'vue-chrts'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import type { AttendanceTrendPoint } from '../types'

const props = defineProps<{
  trendData: AttendanceTrendPoint[]
}>()

const categories = {
  percentage: { name: 'Persentase Kehadiran', color: '#3b82f6' },
}

const xFormatter = (_tick: number, i?: number) =>
  i !== undefined ? (props.trendData[i]?.monthLabel ?? '') : ''
const yFormatter = (tick: number) => `${tick}%`

const hasData = computed(() => props.trendData.length > 0)
</script>

<template>
  <Card class="shadow-none">
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-semibold">
        Tren Persentase Kehadiran per Bulan
      </CardTitle>
    </CardHeader>
    <CardContent>
      <LineChart
        v-if="hasData"
        :data="trendData"
        :categories="categories"
        :height="280"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :curve-type="CurveType.MonotoneX"
        :legend-position="LegendPosition.TopRight"
        :y-grid-line="true"
        :y-num-ticks="5"
        x-label="Bulan"
        y-label="Persentase"
      />
      <p
        v-else
        class="py-10 text-center text-sm text-muted-foreground"
      >
        Belum ada data kehadiran pada semester ini untuk ditampilkan.
      </p>
    </CardContent>
  </Card>
</template>
