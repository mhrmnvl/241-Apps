import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Announcement } from '../types'
import type { Classroom } from '@/features/academic/classroom'

export const useAnnouncementStore = defineStore('announcement', () => {
  const items = ref<Announcement[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const classrooms = ref<Classroom[]>([])
  const selectedClassroomId = ref<string>('')
  const searchQuery = ref<string>('')

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    classrooms,
    selectedClassroomId,
    searchQuery,
  }
})
