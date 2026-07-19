<script setup lang="ts">
import type { PromotionStudentDecision } from '../types'
import { Badge } from '@/ui/badge'
import { GraduationCap, RotateCcw, CheckCircle2 } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  decisions: PromotionStudentDecision[]
  recommendations: {
    studentId: string
    studentName: string
    nis: string
    sourceClassName: string
    targetClassName?: string
  }[]
}>()

const summary = computed(() => {
  let promoted = 0
  let repeated = 0
  let graduated = 0

  for (const d of props.decisions) {
    if (!d.approved && d.action !== 'GRADUATE') continue
    switch (d.action) {
      case 'PROMOTE':
        promoted++
        break
      case 'REPEAT':
        repeated++
        break
      case 'GRADUATE':
        if (d.approved) graduated++
        else repeated++
        break
    }
  }

  return { promoted, repeated, graduated, total: props.decisions.length }
})

const declinedStudents = computed(() => {
  return props.decisions
    .filter((d) => !d.approved)
    .map((d) => {
      const rec = props.recommendations.find((r) => r.studentId === d.studentId)
      return {
        ...d,
        studentName: rec?.studentName ?? '-',
        nis: rec?.nis ?? '-',
        sourceClassName: rec?.sourceClassName ?? '-',
      }
    })
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-3 gap-4">
      <div
        class="rounded-xl border bg-green-50 dark:bg-green-950/20 p-5 text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 class="h-5 w-5 text-green-600" />
        </div>
        <p class="text-3xl font-bold text-green-600 tabular-nums">
          {{ summary.promoted }}
        </p>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Naik Kelas</p>
      </div>
      <div
        class="rounded-xl border bg-amber-50 dark:bg-amber-950/20 p-5 text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <RotateCcw class="h-5 w-5 text-amber-600" />
        </div>
        <p class="text-3xl font-bold text-amber-600 tabular-nums">
          {{ summary.repeated }}
        </p>
        <p class="text-sm text-muted-foreground mt-1 font-medium">
          Tinggal Kelas
        </p>
      </div>
      <div
        class="rounded-xl border bg-blue-50 dark:bg-blue-950/20 p-5 text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <GraduationCap class="h-5 w-5 text-blue-600" />
        </div>
        <p class="text-3xl font-bold text-blue-600 tabular-nums">
          {{ summary.graduated }}
        </p>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Lulus</p>
      </div>
    </div>

    <div
      v-if="declinedStudents.length > 0"
      class="rounded-xl border border-destructive/20 bg-destructive/5"
    >
      <div class="p-4 border-b border-destructive/10">
        <h4 class="font-semibold text-destructive flex items-center gap-2">
          <RotateCcw class="h-4 w-4" />
          Siswa Tinggal Kelas ({{ declinedStudents.length }})
        </h4>
      </div>
      <div class="divide-y divide-destructive/10">
        <div
          v-for="s in declinedStudents"
          :key="s.studentId"
          class="flex items-center justify-between p-4"
        >
          <div>
            <p class="font-medium">{{ s.studentName }}</p>
            <p class="text-xs text-muted-foreground font-mono">{{ s.nis }}</p>
          </div>
          <div class="text-right">
            <Badge
              variant="outline"
              class="bg-background"
              >{{ s.sourceClassName }}</Badge
            >
            <p class="text-xs text-destructive mt-1 italic">
              {{ s.declineReason }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
    >
      <span class="text-sm text-muted-foreground font-medium"
        >Total siswa diproses</span
      >
      <span class="text-lg font-bold tabular-nums">{{ summary.total }}</span>
    </div>
  </div>
</template>
