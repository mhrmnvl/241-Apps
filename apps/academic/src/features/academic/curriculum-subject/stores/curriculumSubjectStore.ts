import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CurriculumSubject } from '../types'
import type { Subject } from '@/features/academic/subject'
import type { ClassroomLevel } from '@/features/academic/classroom-level'

export const useCurriculumSubjectStore = defineStore(
  'curriculumSubject',
  () => {
    const items = ref<CurriculumSubject[]>([])
    const totalItems = ref(0)
    const loading = ref(false)
    const isSaving = ref(false)
    const formError = ref<string | null>(null)

    const subjects = ref<Subject[]>([])
    const classroomLevels = ref<ClassroomLevel[]>([])

    const selectedClassroomLevelId = ref<string>('')

    const curriculumName = ref<string>('')
    const curriculumAcademicYear = ref<string>('')

    return {
      items,
      totalItems,
      loading,
      isSaving,
      formError,
      subjects,
      classroomLevels,
      selectedClassroomLevelId,
      curriculumName,
      curriculumAcademicYear,
    }
  },
)
