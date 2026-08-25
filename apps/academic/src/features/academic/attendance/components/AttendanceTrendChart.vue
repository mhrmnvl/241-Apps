<script setup lang="ts">
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig,
} from '@/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import type { AttendanceTrendPoint } from '../types'

const props = defineProps<{
  trendData: AttendanceTrendPoint[]
}>()

const chartConfig = {
  percentage: {
    label: 'Persentase Kehadiran',
    color: '#2563eb',
  },
} satisfies ChartConfig

const x = (_d: AttendanceTrendPoint, i: number) => i
const y = (d: AttendanceTrendPoint) => d.percentage

const tickFormat = (i: number) => props.trendData[i]?.monthLabel ?? ''
const yTickFormat = (tick: number) => `${tick}%`

const tooltipTemplate = componentToString(chartConfig, ChartTooltipContent, {
  labelFormatter: (i) => props.trendData[Number(i)]?.monthLabel ?? '',
})
</script>

<template>
  <Card class="shadow-none border rounded-xl">
    <CardHeader class="pb-3">
      <CardTitle class="text-base font-semibold tracking-tight">
        Tren Persentase Kehadiran
      </CardTitle>
      <CardDescription class="text-xs text-muted-foreground">
        Perkembangan rata-rata tingkat kehadiran siswa per bulan sepanjang
        semester aktif
      </CardDescription>
    </CardHeader>
    <CardContent class="pt-0">
      <div
        v-if="trendData && trendData.length > 0"
        class="h-[280px] w-full"
      >
        <ChartContainer
          :config="chartConfig"
          class="h-full w-full"
          cursor
        >
          <VisXYContainer
            :data="trendData"
            :margin="{ top: 20, right: 20, bottom: 30, left: 45 }"
            :y-domain="[0, 100]"
          >
            <VisArea
              :x="x"
              :y="y"
              color="#2563eb"
              :opacity="0.15"
              curve-type="monotoneX"
            />
            <VisLine
              :x="x"
              :y="y"
              color="#2563eb"
              :stroke-width="2"
              curve-type="monotoneX"
            />
            <VisAxis
              type="x"
              :x="x"
              :tick-format="tickFormat"
              :num-ticks="trendData.length"
              :grid-line="false"
              :tick-line="false"
            />
            <VisAxis
              type="y"
              :num-ticks="5"
              :tick-format="yTickFormat"
              :grid-line="true"
              :tick-line="false"
            />
            <ChartCrosshair
              v-if="tooltipTemplate"
              :template="tooltipTemplate"
              color="#2563eb"
            />
            <ChartTooltip />
          </VisXYContainer>
        </ChartContainer>
      </div>
      <div
        v-else
        class="py-12 text-center text-sm text-muted-foreground"
      >
        Belum ada data kehadiran pada semester ini untuk ditampilkan.
      </div>
    </CardContent>
  </Card>
</template>
