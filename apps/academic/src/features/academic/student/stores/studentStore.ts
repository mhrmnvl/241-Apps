import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Student, GradeOption } from '../types'
import type { Classroom } from '@/features/academic/classroom'

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([])
  const classrooms = ref<Classroom[]>([])
  const grades = ref<GradeOption[]>([])
  const totalStudents = ref(0)

  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const filters = ref({
    gradeId: 'all',
    classroomId: 'all',
    keyword: '',
  })

  const filteredStudents = computed(() => {
    if (filters.value.gradeId === 'all') return students.value
    return students.value.filter(
      (s: Student) => s.gradeId === filters.value.gradeId,
    )
  })

  return {
    students,
    classrooms,
    grades,
    totalStudents,
    loading,
    isSaving,
    formError,
    filters,
    filteredStudents,
  }
})
