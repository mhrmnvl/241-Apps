import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  Attendance,
  AttendanceRecapItem,
  AttendanceInputRow,
} from '../types'
import type { Classroom } from '@/features/academic/classroom'
import type { Semester } from '@/features/academic/semester'

export const useAttendanceStore = defineStore('attendance', () => {
  const items = ref<Attendance[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const classrooms = ref<Classroom[]>([])
  const semesters = ref<Semester[]>([])

  const selectedClassroomId = ref<string>('')
  const selectedSemesterId = ref<string>('')
  const selectedDate = ref<string>('')

  const inputRows = ref<AttendanceInputRow[]>([])

  const recapItems = ref<AttendanceRecapItem[]>([])
  const recapLoading = ref(false)

  const activeTab = ref<'input' | 'recap'>('input')

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    semesters,
    selectedClassroomId,
    selectedSemesterId,
    selectedDate,
    inputRows,
    recapItems,
    recapLoading,
    activeTab,
  }
})
