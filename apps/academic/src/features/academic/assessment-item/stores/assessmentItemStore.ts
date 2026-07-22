import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AssessmentItem } from '../types'
import type { TeachingAssignment } from '@/features/academic/teaching-assignment/types'
import type { Semester } from '@/features/academic/semester'

export const useAssessmentItemStore = defineStore('assessmentItem', () => {
  const items = ref<AssessmentItem[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const classrooms = ref<
    {
      id: string
      name: string | null
      code?: string
      classroomLevel?: { name: string }
    }[]
  >([])
  const subjects = ref<
    { id: string; name: string; gradeLevel?: string | number }[]
  >([])
  const semesters = ref<Semester[]>([])

  const selectedClassroomId = ref<string | null>(null)
  const selectedSubjectId = ref<string | null>(null)
  const selectedSemesterId = ref<string | null>(null)

  const teachingAssignment = ref<TeachingAssignment | null>(null)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    semesters,
    selectedClassroomId,
    selectedSubjectId,
    selectedSemesterId,
    teachingAssignment,
  }
})
