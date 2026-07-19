import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StudentGraduation, GraduationAcademicYear } from '../types'
import type { Student } from '@/features/academic/student'

export const useStudentGraduationStore = defineStore(
  'studentGraduation',
  () => {
    const items = ref<StudentGraduation[]>([])
    const totalItems = ref(0)
    const loading = ref(false)
    const isSaving = ref(false)
    const formError = ref<string | null>(null)

    const students = ref<Student[]>([])
    const academicYears = ref<GraduationAcademicYear[]>([])

    const selectedAcademicYearId = ref<string>('')

    return {
      items,
      totalItems,
      loading,
      isSaving,
      formError,
      students,
      academicYears,
      selectedAcademicYearId,
    }
  },
)
