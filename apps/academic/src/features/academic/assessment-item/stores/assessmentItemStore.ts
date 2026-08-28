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
  /**
   * No grade on a subject: `Subject` is `id`, `code`, `name` and nothing else.
   * A subject belongs to a grade only through `CurriculumSubject`, so the
   * optional `gradeLevel` this used to declare was never filled by anything —
   * and the filter that read it printed "(Kelas -)" against every subject.
   */
  const subjects = ref<{ id: string; name: string }[]>([])
  const semesters = ref<Semester[]>([])

  const selectedClassroomId = ref<string | null>(null)
  const selectedSubjectId = ref<string | null>(null)
  const selectedSemesterId = ref<string | null>(null)

  /**
   * Every assignment the viewer may write tasks under, in the active term.
   *
   * The filters are derived from these rather than from the full reference
   * lists, because a task can only exist where an assignment does. Offering a
   * class and a subject nobody pairs is offering a combination that cannot be
   * saved — which read as missing data rather than as an impossible choice.
   */
  const assignments = ref<TeachingAssignment[]>([])

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
    assignments,
    teachingAssignment,
  }
})
