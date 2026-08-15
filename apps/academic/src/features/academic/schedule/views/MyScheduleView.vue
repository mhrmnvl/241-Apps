<script setup lang="ts">
import { Card, CardContent } from '@/ui/card'
import { onMounted } from 'vue'
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
  user,
  init,
} = useSchedule()

onMounted(() => void init())
</script>

<template>
  <div class="space-y-6 p-4 md:p-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Jadwal Saya</h1>
      <p class="text-sm text-muted-foreground">
        Jadwal Anda pada semester berjalan.
      </p>
    </div>

    <Card v-if="!isLoadingSchedule && lessons.length === 0">
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
</template>
