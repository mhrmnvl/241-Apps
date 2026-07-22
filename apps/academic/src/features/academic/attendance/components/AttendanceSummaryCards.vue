<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/ui/card'
import { Progress } from '@/ui'
import { Badge } from '@/ui/badge'
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import type { AttendanceRecapItem } from '../types'

const props = defineProps<{
  recapItems: AttendanceRecapItem[]
  classPercentage: number
  /** Percentage-point delta vs the previous month. null when no prior data. */
  monthDelta: number | null
  loading?: boolean
}>()

const totalStudents = computed(() => props.recapItems.length)

const totalAbsent = computed(() =>
  props.recapItems.reduce((sum, item) => sum + item.ABSENT, 0),
)

const deltaIcon = computed(() => {
  if (props.monthDelta === null || props.monthDelta === 0) return Minus
  return props.monthDelta > 0 ? TrendingUp : TrendingDown
})

const deltaClass = computed(() => {
  if (props.monthDelta === null || props.monthDelta === 0) return ''
  return props.monthDelta > 0
    ? 'border-transparent bg-emerald-500/10 text-emerald-600'
    : 'border-transparent bg-rose-500/10 text-rose-600'
})
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Card class="shadow-none">
      <CardContent class="p-4">
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          >
            <Users class="size-4 text-primary" />
          </div>
          <div>
            <p class="text-xs font-medium text-muted-foreground">Total Siswa</p>
            <p class="text-2xl font-bold tabular-nums">{{ totalStudents }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardContent class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-muted-foreground">
                Rata-rata Kehadiran
              </p>
              <Badge
                v-if="monthDelta !== null"
                variant="secondary"
                :class="deltaClass"
              >
                <component
                  :is="deltaIcon"
                  class="size-3"
                />
                {{ monthDelta > 0 ? '+' : '' }}{{ monthDelta }}%
              </Badge>
            </div>
            <p class="mt-1 text-2xl font-bold tabular-nums">
              {{ classPercentage }}%
            </p>
            <Progress
              :model-value="classPercentage"
              class="mt-2 h-1.5"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardContent class="p-4">
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10"
          >
            <Users class="size-4 text-rose-600" />
          </div>
          <div>
            <p class="text-xs font-medium text-muted-foreground">
              Total Alpha (Bulan Ini)
            </p>
            <p class="text-2xl font-bold tabular-nums">{{ totalAbsent }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
