import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  TeachingAssignment,
  TeachingAssignmentSubjectOption,
} from '../types'
import type { Classroom } from '@/features/academic/classroom'
import type { Semester } from '@/features/academic/semester'
import type { Teacher } from '@/features/academic/teacher'

export const useTeachingAssignmentStore = defineStore(
  'teachingAssignment',
  () => {
    const items = ref<TeachingAssignment[]>([])
    const totalItems = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const loading = ref(false)
    const isSaving = ref(false)
    const formError = ref<string | null>(null)

    const classrooms = ref<Classroom[]>([])
    const subjects = ref<TeachingAssignmentSubjectOption[]>([])
    const semesters = ref<Semester[]>([])
    const teachers = ref<Teacher[]>([])

    const selectedSemesterId = ref<string>('')
    const selectedClassroomId = ref<string>('')

    return {
      items,
      totalItems,
      currentPage,
      pageSize,
      loading,
      isSaving,
      formError,
      classrooms,
      subjects,
      semesters,
      teachers,
      selectedSemesterId,
      selectedClassroomId,
    }
  },
)
