import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  ScheduleClassroom,
  ScheduleTimeSlot,
  ScheduleLesson,
} from '../types'

export const useScheduleStore = defineStore('schedule', () => {
  const classrooms = ref<ScheduleClassroom[]>([])
  const timeSlots = ref<ScheduleTimeSlot[]>([])
  const lessons = ref<ScheduleLesson[]>([])
  const selectedClassroomId = ref<string>('')

  const isLoadingClassrooms = ref(false)
  const isLoadingSchedule = ref(false)

  return {
    classrooms,
    timeSlots,
    lessons,
    selectedClassroomId,
    isLoadingClassrooms,
    isLoadingSchedule,
  }
})
