<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoleGuard } from '@/features/platform/auth'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Progress } from '@/ui/progress'

import { Skeleton } from '@/ui/skeleton'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  PencilLine,
  School,
  Users,
} from 'lucide-vue-next'
import { DataTable } from '@/ui'
import { createTodayLessonColumns } from './todayLessonColumns'
import type {
  MyDashboardUngradedAssessment,
  MyTeacherDashboard,
} from '../types'

const props = defineProps<{
  data: MyTeacherDashboard
  isWeeklyHoliday: boolean
  loading?: boolean
  todayDate?: string
}>()

const { can } = useRoleGuard()
const canGrade = computed(() => can('student-scores.read'))

const todayLessonColumns = computed(() =>
  createTodayLessonColumns(props.todayDate),
)

function gradedPercent(row: MyDashboardUngradedAssessment): number {
  if (row.studentCount === 0) return 0
  return Math.round((row.gradedCount / row.studentCount) * 100)
}

const hiddenUngraded = computed(
  () => props.data.ungradedTotal - props.data.ungradedAssessments.length,
)
</script>

<template>
  <div class="space-y-6">
    <!-- Stat Cards — same pattern as admin dashboard -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card class="shadow-none">
        <CardContent class="p-4">
          <div
            v-if="loading"
            class="space-y-3"
          >
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
          <div
            v-else
            class="flex items-start justify-between"
          >
            <div>
              <p class="text-xs font-medium text-muted-foreground">
                Kelas Diampu
              </p>
              <p class="mt-1 text-2xl font-bold tabular-nums">
                {{ data.load.classroomCount }}
              </p>
              <p class="mt-0.5 text-[11px] text-muted-foreground">
                Kelas aktif semester ini
              </p>
            </div>
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"
            >
              <School class="size-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-none">
        <CardContent class="p-4">
          <div
            v-if="loading"
            class="space-y-3"
          >
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
          <div
            v-else
            class="flex items-start justify-between"
          >
            <div>
              <p class="text-xs font-medium text-muted-foreground">
                Mata Pelajaran
              </p>
              <p class="mt-1 text-2xl font-bold tabular-nums">
                {{ data.load.subjectCount }}
              </p>
              <p class="mt-0.5 text-[11px] text-muted-foreground">
                Mapel yang diajar
              </p>
            </div>
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10"
            >
              <BookOpen class="size-4 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-none">
        <CardContent class="p-4">
          <div
            v-if="loading"
            class="space-y-3"
          >
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
          <div
            v-else
            class="flex items-start justify-between"
          >
            <div>
              <p class="text-xs font-medium text-muted-foreground">
                Belum Dinilai
              </p>
              <p class="mt-1 text-2xl font-bold tabular-nums">
                {{ data.ungradedTotal }}
              </p>
              <p class="mt-0.5 text-[11px] text-muted-foreground">
                Penilaian perlu diselesaikan
              </p>
            </div>
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10"
            >
              <PencilLine class="size-4 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Jadwal Hari Ini — DataTable in Card -->
    <Card class="shadow-none">
      <CardHeader class="border-b px-5 py-3.5">
        <div class="flex items-center gap-2">
          <Clock class="size-4 text-muted-foreground" />
          <CardTitle class="text-sm font-semibold"> Jadwal Hari Ini </CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-4 px-5 pb-5">
        <DataTable
          :columns="todayLessonColumns"
          :data="data.todayLessons"
          :is-loading="loading"
          item-label="jadwal"
          hide-per-page
          hide-pagination
        />
      </CardContent>
    </Card>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Perwalian Kelas — only for wali kelas -->
      <Card
        v-if="data.supervisedClassrooms.length > 0"
        class="shadow-none"
      >
        <CardHeader class="border-b px-5 py-3.5">
          <div class="flex items-center gap-2">
            <Users class="size-4 text-muted-foreground" />
            <CardTitle class="text-sm font-semibold">
              Perwalian Kelas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-5">
          <ul class="space-y-2">
            <li
              v-for="classroom in data.supervisedClassrooms"
              :key="classroom.id"
              class="flex items-center justify-between rounded-lg border px-4 py-2.5"
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

      <!-- Penilaian Belum Selesai -->
      <Card class="shadow-none">
        <CardHeader class="border-b px-5 py-3.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <PencilLine class="size-4 text-muted-foreground" />
              <CardTitle class="text-sm font-semibold">
                Penilaian Belum Selesai
              </CardTitle>
            </div>
            <RouterLink
              v-if="canGrade && data.ungradedTotal > 0"
              :to="{ name: 'assessment-grading' }"
              class="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Lihat Semua
              <ChevronRight class="size-3.5" />
            </RouterLink>
          </div>
        </CardHeader>
        <CardContent class="p-5">
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
                class="block rounded-lg border px-4 py-3 transition-colors"
                :class="canGrade ? 'hover:bg-muted/50 cursor-pointer' : ''"
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
                    {{ item.gradedCount }}/{{ item.studentCount }}
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
</template>
