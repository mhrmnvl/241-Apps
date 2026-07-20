import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CurriculumSubject } from '../types'
import type { Subject } from '@/features/academic/subject'
import type { Grade } from '@/features/academic/grade'

export const useCurriculumSubjectStore = defineStore(
  'curriculumSubject',
  () => {
    const items = ref<CurriculumSubject[]>([])
    const totalItems = ref(0)
    const loading = ref(false)
    const isSaving = ref(false)
    const formError = ref<string | null>(null)

    const subjects = ref<Subject[]>([])
    const grades = ref<Grade[]>([])

    const selectedGradeId = ref<string>('')

    const curriculumName = ref<string>('')
    const curriculumAcademicYear = ref<string>('')

    return {
      items,
      totalItems,
      loading,
      isSaving,
      formError,
      subjects,
      grades,
      selectedGradeId,
      curriculumName,
      curriculumAcademicYear,
    }
  },
)
