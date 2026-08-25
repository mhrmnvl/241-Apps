<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { CalendarOff, Clock, DoorClosed } from 'lucide-vue-next'
import type { MyDashboardLesson } from '../types'

/**
 * One card, two audiences. A student's row names the teacher, a teacher's row
 * names the class — the payload leaves whichever does not apply null, so the
 * template asks the data rather than a prop about who is looking.
 */
const props = defineProps<{
  lessons: MyDashboardLesson[]
  isWeeklyHoliday: boolean
  loading?: boolean
}>()

const isEmpty = computed(() => props.lessons.length === 0)
</script>

<template>
  <Card class="shadow-none">
    <CardHeader class="border-b px-5 py-3.5">
      <div class="flex items-center gap-2">
        <Clock class="size-4 text-muted-foreground" />
        <CardTitle class="text-sm font-semibold"> Jadwal Hari Ini </CardTitle>
      </div>
    </CardHeader>
    <CardContent class="p-5">
      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="space-y-2"
      >
        <Skeleton
          v-for="i in 4"
          :key="i"
          class="h-12 w-full rounded-lg"
        />
      </div>

      <!-- An empty timetable has two very different causes, and saying which
           is the difference between "nothing today" and "something is wrong". -->
      <div
        v-else-if="isEmpty"
        class="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground"
      >
        <CalendarOff class="size-8 opacity-40" />
        <p v-if="isWeeklyHoliday">Hari ini libur mingguan.</p>
        <p v-else>Tidak ada jadwal hari ini.</p>
      </div>

      <ul
        v-else
        class="space-y-2"
      >
        <li
          v-for="lesson in lessons"
          :key="lesson.id"
          class="flex items-center gap-3 rounded-lg border px-4 py-2.5"
        >
          <div
            class="w-24 shrink-0 text-sm font-medium tabular-nums text-muted-foreground"
          >
            {{ lesson.startTime }} - {{ lesson.endTime }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ lesson.subjectName }}</p>
            <p class="truncate text-xs text-muted-foreground">
              {{ lesson.teacherName ?? lesson.classroomCode ?? '-' }}
            </p>
          </div>
          <Badge
            v-if="lesson.room"
            variant="secondary"
            class="shrink-0 gap-1 font-normal"
          >
            <DoorClosed class="size-3" />
            {{ lesson.room }}
          </Badge>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
