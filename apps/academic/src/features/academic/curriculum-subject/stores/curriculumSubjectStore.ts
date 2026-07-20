import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CurriculumSubject } from '../types'
import type { Subject } from '@/features/academic/subject'

export const useCurriculumSubjectStore = defineStore(
  'curriculumSubject',
  () => {
    const items = ref<CurriculumSubject[]>([])
    const totalItems = ref(0)
    const loading = ref(false)
    const isSaving = ref(false)
    const formError = ref<string | null>(null)

    const subjects = ref<Subject[]>([])

    const curriculumName = ref<string>('')
    const curriculumAcademicYear = ref<string>('')

    return {
      items,
      totalItems,
      loading,
      isSaving,
      formError,
      subjects,
      curriculumName,
      curriculumAcademicYear,
    }
  },
)
