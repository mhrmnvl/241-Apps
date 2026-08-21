<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoleGuard } from '@/features/platform/auth'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import {
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  UserCheck,
} from 'lucide-vue-next'
import TodayLessonsCard from './TodayLessonsCard.vue'
import type { MyStudentDashboard } from '../types'

const props = defineProps<{
  data: MyStudentDashboard
  isWeeklyHoliday: boolean
}>()

// Reading your own record is its own permission, so a link to one of those
// screens is offered only to someone who would actually be let in — the router
// bounces the rest straight back here, which reads as a broken button.
const { can } = useRoleGuard()
const canOpenOwnReportCard = computed(() => can('report-cards.read-own'))
const canOpenOwnScores = computed(() => can('student-scores.read-own'))

const classroomLabel = computed(() => {
  const classroom = props.data.classroom
  if (!classroom) return null
  return classroom.name
    ? `${classroom.code} — ${classroom.name}`
    : classroom.code
})

const attendanceItems = computed(() => {
  const recap = props.data.attendance
  return [
    {
      key: 'present',
      label: 'Hadir',
      value: recap.present,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'sick',
      label: 'Sakit',
      value: recap.sick,
      tone: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'excused',
      label: 'Izin',
      value: recap.excused,
      tone: 'text-sky-600 dark:text-sky-400',
    },
    {
      key: 'late',
      label: 'Terlambat',
      value: recap.late,
      tone: 'text-orange-600 dark:text-orange-400',
    },
    {
      key: 'absent',
      label: 'Alfa',
      value: recap.absent,
      tone: 'text-destructive',
    },
  ]
})

const totalAttendance = computed(() =>
  attendanceItems.value.reduce((sum, item) => sum + item.value, 0),
)
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardContent class="flex flex-wrap items-center gap-3 pt-6">
        <div
          class="flex size-10 items-center justify-center rounded-full bg-primary/10"
        >
          <GraduationCap class="size-5 text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-muted-foreground">Kelas Anda</p>
          <p class="truncate text-lg font-semibold">
            {{ classroomLabel ?? 'Belum terdaftar di kelas' }}
          </p>
        </div>
        <Button
          v-if="data.latestReportCard && canOpenOwnReportCard"
          as-child
          variant="outline"
          size="sm"
        >
          <RouterLink :to="{ name: 'my-rapor' }">
            <FileText class="size-4" />
            Rapor {{ data.latestReportCard.semesterName }}
          </RouterLink>
        </Button>
      </CardContent>
    </Card>

    <div class="grid gap-4 lg:grid-cols-2">
      <TodayLessonsCard
        :lessons="data.todayLessons"
        :is-weekly-holiday="isWeeklyHoliday"
      />

      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <UserCheck class="size-4 text-muted-foreground" />
              Rekap Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              v-if="totalAttendance === 0"
              class="py-4 text-center text-sm text-muted-foreground"
            >
              Belum ada catatan kehadiran semester ini.
            </p>
            <dl
              v-else
              class="grid grid-cols-5 gap-2 text-center"
            >
              <div
                v-for="item in attendanceItems"
                :key="item.key"
              >
                <dd
                  class="text-xl font-semibold tabular-nums"
                  :class="item.tone"
                >
                  {{ item.value }}
                </dd>
                <dt class="text-xs text-muted-foreground">{{ item.label }}</dt>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex-row items-center justify-between space-y-0">
            <CardTitle class="flex items-center gap-2 text-base">
              <ClipboardList class="size-4 text-muted-foreground" />
              Nilai Terbaru
            </CardTitle>
            <Button
              v-if="canOpenOwnScores"
              as-child
              variant="ghost"
              size="sm"
              class="text-muted-foreground"
            >
              <RouterLink :to="{ name: 'my-scores' }">
                Lihat Semua
                <ChevronRight class="size-4" />
              </RouterLink>
            </Button>
          </CardHeader>
          <CardContent>
            <p
              v-if="data.latestScores.length === 0"
              class="py-4 text-center text-sm text-muted-foreground"
            >
              Belum ada nilai yang masuk.
            </p>
            <ul
              v-else
              class="divide-y"
            >
              <li
                v-for="score in data.latestScores"
                :key="score.id"
                class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">
                    {{ score.subjectName }}
                  </p>
                  <p class="truncate text-xs text-muted-foreground">
                    {{ score.assessmentName }}
                  </p>
                </div>
                <!-- Out of its own maximum: an assessment marked out of 50 is
                     not a failing 40, and the denominator is what says so. -->
                <Badge
                  variant="secondary"
                  class="shrink-0 tabular-nums"
                >
                  {{ score.score ?? '-' }} / {{ score.maxScore }}
                </Badge>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
