<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBreadcrumbs } from '@/shared/composables/useBreadcrumbs'
import { formatEntityName } from '@/shared/utils/utils'
import { useSchedule } from '../composables/useSchedule'
import ScheduleHeader from '../components/ScheduleHeader.vue'
import ScheduleSkeleton from '../components/ScheduleSkeleton.vue'
import ScheduleEmptyState from '../components/ScheduleEmptyState.vue'
import ScheduleTable from '../components/ScheduleTable.vue'

const {
  classrooms,
  lessons,
  selectedClassroomId,
  isLoadingSchedule,
  isAdmin,
  isPersonal,
  user,
  DAYS,
  selectedClassroom,
  lessonMap,
  sortedTimeSlots,
  breadcrumbs,
  init,
  onClassroomChange,
} = useSchedule()

// The trail follows the classroom the user picks, so it is published to the
// shell rather than stated in the route.
useBreadcrumbs(() => breadcrumbs.value)

const scheduleClassroomOptions = computed(() =>
  classrooms.value.map((cls) => ({
    value: cls.id,
    label: formatEntityName(cls.code ?? ''),
  })),
)

onMounted(init)
</script>

<template>
  <div class="p-2 pt-0 md:p-6 md:pt-4 lg:p-8 space-y-5">
    <ScheduleHeader
      :is-admin="isAdmin"
      :is-personal="isPersonal"
      :selected-classroom-id="selectedClassroomId"
      :options="scheduleClassroomOptions"
      @classroom-change="onClassroomChange"
    />

    <ScheduleSkeleton v-if="isLoadingSchedule" />

    <ScheduleEmptyState
      v-else-if="!isPersonal && !selectedClassroomId"
      message="Pilih kelas untuk melihat jadwal pelajaran."
    />

    <ScheduleEmptyState
      v-else-if="lessons.length === 0"
      :message="`Jadwal ${isPersonal ? 'mengajar Anda' : 'untuk kelas ini'} belum diatur atau kosong.`"
    />

    <ScheduleTable
      v-else
      :is-personal="isPersonal"
      :user="user"
      :selected-classroom="selectedClassroom"
      :sorted-time-slots="sortedTimeSlots"
      :days="DAYS"
      :lesson-map="lessonMap"
    />
  </div>
</template>
