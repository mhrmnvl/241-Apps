<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { onMounted } from 'vue'
import ScheduleExportActions from '../components/ScheduleExportActions.vue'
import ScheduleTable from '../components/ScheduleTable.vue'
import { useSchedule } from '../composables/useSchedule'

/**
 * The signed-in person's own schedule.
 *
 * A student's classroom timetable, a teacher's teaching schedule, or both —
 * the server decides from their records, so this screen never asks and never
 * offers a classroom picker. That is the whole difference from `ScheduleView`,
 * which exists for someone browsing a classroom that is not theirs.
 *
 * It reuses `ScheduleTable`, because a timetable renders the same either way.
 * What differs is who chose it, and that choice is not made here.
 */
const {
  lessons,
  isLoadingSchedule,
  DAYS,
  lessonMap,
  sortedTimeSlots,
  scheduleSheet,
  user,
  init,
} = useSchedule()

onMounted(() => void init())
</script>

<template>
  <div class="p-4 md:p-5 lg:p-6">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-4 shrink-0"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Jadwal Saya
        </CardTitle>

        <ScheduleExportActions
          :sheet="scheduleSheet"
          :disabled="isLoadingSchedule || lessons.length === 0"
        />
      </CardHeader>

      <div class="p-4">
        <Card
          v-if="!isLoadingSchedule && lessons.length === 0"
          class="shadow-none"
        >
          <CardContent class="py-10 text-center text-sm text-muted-foreground">
            Jadwal Anda belum tersedia. Ini terjadi bila Anda belum terdaftar di
            sebuah kelas pada semester berjalan, atau jadwal kelas Anda belum
            disusun.
          </CardContent>
        </Card>

        <ScheduleTable
          v-else
          is-personal
          :user="user"
          :selected-classroom="undefined"
          :sorted-time-slots="sortedTimeSlots"
          :days="DAYS"
          :lesson-map="lessonMap"
        />
      </div>
    </Card>
  </div>
</template>
