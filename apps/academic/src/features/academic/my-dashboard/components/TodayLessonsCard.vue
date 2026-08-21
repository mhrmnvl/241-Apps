<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
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
}>()

const isEmpty = computed(() => props.lessons.length === 0)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-base">
        <Clock class="size-4 text-muted-foreground" />
        Jadwal Hari Ini
      </CardTitle>
    </CardHeader>
    <CardContent>
      <!-- An empty timetable has two very different causes, and saying which
           is the difference between "nothing today" and "something is wrong". -->
      <div
        v-if="isEmpty"
        class="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground"
      >
        <CalendarOff class="size-8 opacity-40" />
        <p v-if="isWeeklyHoliday">Hari ini libur mingguan.</p>
        <p v-else>Tidak ada jadwal hari ini.</p>
      </div>

      <ul
        v-else
        class="divide-y"
      >
        <li
          v-for="lesson in lessons"
          :key="lesson.id"
          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
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
