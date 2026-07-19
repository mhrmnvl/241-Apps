import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Student, ClassroomLevelOption } from '../types'
import type { Classroom } from '@/features/academic/classroom'

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([])
  const classrooms = ref<Classroom[]>([])
  const classroomLevels = ref<ClassroomLevelOption[]>([])
  const totalStudents = ref(0)

  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const filters = ref({
    classroomLevelId: 'all',
    classroomId: 'all',
    keyword: '',
  })

  const filteredStudents = computed(() => {
    if (filters.value.classroomLevelId === 'all') return students.value
    return students.value.filter(
      (s: Student) => s.classroomLevelId === filters.value.classroomLevelId,
    )
  })

  return {
    students,
    classrooms,
    classroomLevels,
    totalStudents,
    loading,
    isSaving,
    formError,
    filters,
    filteredStudents,
  }
})
