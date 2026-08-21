<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoleGuard } from '@/features/platform/auth'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Progress } from '@/ui/progress'
import {
  BookOpen,
  CheckCircle2,
  PencilLine,
  School,
  Users,
} from 'lucide-vue-next'
import TodayLessonsCard from './TodayLessonsCard.vue'
import type {
  MyDashboardUngradedAssessment,
  MyTeacherDashboard,
} from '../types'

const props = defineProps<{
  data: MyTeacherDashboard
  isWeeklyHoliday: boolean
}>()

// The grading screen is the point of this panel, so the rows are links — but
// only for someone the router would actually let through.
const { can } = useRoleGuard()
const canGrade = computed(() => can('student-scores.read'))

/**
 * How much of an assessment is marked.
 *
 * Guarded against an empty class even though the backend already excludes those
 * — a class with nobody in it is empty, not behind — because a percentage that
 * can divide by zero is one refactor away from `NaN%` on the screen.
 */
function gradedPercent(row: MyDashboardUngradedAssessment): number {
  if (row.studentCount === 0) return 0
  return Math.round((row.gradedCount / row.studentCount) * 100)
}

const hiddenUngraded = computed(
  () => props.data.ungradedTotal - props.data.ungradedAssessments.length,
)
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent class="flex items-center gap-3 pt-6">
          <div
            class="flex size-10 items-center justify-center rounded-full bg-primary/10"
          >
            <School class="size-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-semibold tabular-nums">
              {{ data.load.classroomCount }}
            </p>
            <p class="text-sm text-muted-foreground">Kelas Diampu</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex items-center gap-3 pt-6">
          <div
            class="flex size-10 items-center justify-center rounded-full bg-primary/10"
          >
            <BookOpen class="size-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-semibold tabular-nums">
              {{ data.load.subjectCount }}
            </p>
            <p class="text-sm text-muted-foreground">Mata Pelajaran</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex items-center gap-3 pt-6">
          <div
            class="flex size-10 items-center justify-center rounded-full bg-primary/10"
          >
            <PencilLine class="size-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-semibold tabular-nums">
              {{ data.ungradedTotal }}
            </p>
            <p class="text-sm text-muted-foreground">Penilaian Belum Selesai</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <TodayLessonsCard
        :lessons="data.todayLessons"
        :is-weekly-holiday="isWeeklyHoliday"
      />

      <div class="space-y-4">
        <!-- Only for a wali kelas. Most teachers supervise no class at all, and
             an empty "Perwalian" card would be a permanent blank on their screen. -->
        <Card v-if="data.supervisedClassrooms.length > 0">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Users class="size-4 text-muted-foreground" />
              Perwalian Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="divide-y">
              <li
                v-for="classroom in data.supervisedClassrooms"
                :key="classroom.id"
                class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">
                    {{ classroom.code }}
                  </p>
                  <p
                    v-if="classroom.name"
                    class="truncate text-xs text-muted-foreground"
                  >
                    {{ classroom.name }}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  class="shrink-0 tabular-nums"
                >
                  {{ classroom.studentCount }} siswa
                </Badge>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <PencilLine class="size-4 text-muted-foreground" />
              Penilaian Belum Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="data.ungradedAssessments.length === 0"
              class="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground"
            >
              <CheckCircle2 class="size-8 text-emerald-500 opacity-70" />
              <p>Semua penilaian sudah lengkap.</p>
            </div>

            <ul
              v-else
              class="space-y-3"
            >
              <li
                v-for="item in data.ungradedAssessments"
                :key="item.id"
              >
                <component
                  :is="canGrade ? RouterLink : 'div'"
                  v-bind="
                    canGrade
                      ? {
                          to: {
                            name: 'StudentScoreGrading',
                            params: { assessmentItemId: item.id },
                          },
                        }
                      : {}
                  "
                  class="block rounded-md transition-colors"
                  :class="canGrade ? 'hover:bg-muted/50' : ''"
                >
                  <div class="flex items-center gap-3">
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium">
                        {{ item.name }}
                      </p>
                      <p class="truncate text-xs text-muted-foreground">
                        {{ item.subjectName }} · {{ item.classroomCode }}
                      </p>
                    </div>
                    <span
                      class="shrink-0 text-xs tabular-nums text-muted-foreground"
                    >
                      {{ item.gradedCount }} dari {{ item.studentCount }} siswa
                    </span>
                  </div>
                  <Progress
                    :model-value="gradedPercent(item)"
                    class="mt-2 h-1.5"
                  />
                </component>
              </li>
            </ul>

            <p
              v-if="hiddenUngraded > 0"
              class="mt-4 border-t pt-3 text-xs text-muted-foreground"
            >
              dan {{ hiddenUngraded }} penilaian lainnya
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
