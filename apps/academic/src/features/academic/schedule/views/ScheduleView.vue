<script setup lang="ts">
import { onMounted, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
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
  isTeacher,
  user,
  DAYS,
  selectedClassroom,
  lessonMap,
  sortedTimeSlots,
  breadcrumbs,
  init,
  onClassroomChange,
} = useSchedule()

const scheduleClassroomOptions = computed(() =>
  classrooms.value.map((cls) => ({
    value: cls.id,
    label: formatEntityName(cls.code ?? cls.name ?? ''),
  })),
)

onMounted(init)
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-2 pt-0 md:p-6 md:pt-4 lg:p-8 space-y-5">
      <ScheduleHeader
        :is-admin="isAdmin"
        :is-teacher="isTeacher"
        :selected-classroom-id="selectedClassroomId"
        :options="scheduleClassroomOptions"
        @classroom-change="onClassroomChange"
      />

      <ScheduleSkeleton v-if="isLoadingSchedule" />

      <ScheduleEmptyState
        v-else-if="!isTeacher && !selectedClassroomId"
        message="Pilih kelas untuk melihat jadwal pelajaran."
      />

      <ScheduleEmptyState
        v-else-if="lessons.length === 0"
        :message="`Jadwal ${isTeacher ? 'mengajar Anda' : 'untuk kelas ini'} belum diatur atau kosong.`"
      />

      <ScheduleTable
        v-else
        :is-teacher="isTeacher"
        :user="user"
        :selected-classroom="selectedClassroom"
        :sorted-time-slots="sortedTimeSlots"
        :days="DAYS"
        :lesson-map="lessonMap"
      />
    </div>
  </AppLayout>
</template>
