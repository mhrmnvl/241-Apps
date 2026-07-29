import { defineStore } from 'pinia'
import { ref } from 'vue'
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

  const currentPage = ref(1)
  const pageSize = ref(10)

  const filters = ref({
    gradeId: 'all',
    classroomId: 'all',
    keyword: '',
  })

  return {
    students,
    classrooms,
    grades,
    totalStudents,
    loading,
    isSaving,
    formError,
    currentPage,
    pageSize,
    filters,
  }
})
