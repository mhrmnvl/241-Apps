import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RaporData } from '../types'
import type { Classroom } from '@/features/academic/classroom'
import type { Semester } from '@/features/academic/semester'

export const useRaporStore = defineStore('rapor', () => {
  const rapors = ref<RaporData[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const isSaving = ref(false)
  const isGenerating = ref(false)
  const formError = ref<string | null>(null)

  const classrooms = ref<Classroom[]>([])
  const semesters = ref<Semester[]>([])

  const selectedClassroomId = ref<string | null>(null)
  const selectedSemesterId = ref<string | null>(null)

  return {
    rapors,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    isGenerating,
    formError,
    classrooms,
    semesters,
    selectedClassroomId,
    selectedSemesterId,
  }
})
