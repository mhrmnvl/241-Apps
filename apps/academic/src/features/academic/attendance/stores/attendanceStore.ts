import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  Attendance,
  AttendanceRecapItem,
  AttendanceInputRow,
  AttendanceTrendPoint,
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

  const now = new Date()
  const selectedMonth = ref<number>(now.getMonth() + 1)
  const selectedYear = ref<number>(now.getFullYear())

  const inputRows = ref<AttendanceInputRow[]>([])

  /**
   * False when presence could not be reached. The screen then behaves exactly
   * as it did before this feature — every student needing a decision — and says
   * so rather than silently offering no pre-fill.
   */
  const gateAvailable = ref(true)

  const recapItems = ref<AttendanceRecapItem[]>([])
  const recapLoading = ref(false)

  const trendData = ref<AttendanceTrendPoint[]>([])
  const trendLoading = ref(false)

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
    selectedMonth,
    selectedYear,
    inputRows,
    gateAvailable,
    recapItems,
    recapLoading,
    trendData,
    trendLoading,
    activeTab,
  }
})
