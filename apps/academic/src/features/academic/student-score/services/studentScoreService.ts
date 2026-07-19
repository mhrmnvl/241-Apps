import { assessmentItemApi } from '@/features/academic/assessment-item'
import type { AssessmentItemSavePayload } from '@/features/academic/assessment-item'
import {
  classroomApi,
  studentEnrollmentApi,
} from '@/features/academic/classroom'
import type { StudentEnrollment } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { useStudentScoreStore } from '../stores/studentScoreStore'
import type { StudentScoreRow } from '../types'
import { studentScoreApi } from '../api/studentScoreApi'
import type { StudentScore, StudentScoreSavePayload } from '../types'
import { subjectApi } from '@/features/academic/subject'
import { teachingAssignmentApi } from '@/features/academic/teaching-assignment'

import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const studentScoreService = {
  fetchRelatedData: async () => {
    const store = useStudentScoreStore()
    try {
      const [classroomRes, subjectRes, semesterRes] = await Promise.all([
        classroomApi.getClassrooms({ limit: 100 }),
        subjectApi.getSubjects({ limit: 100 }),
        semesterApi.getSemesters({ limit: 100 }),
      ])
      store.classrooms = classroomRes.data?.data ?? []
      store.subjects = subjectRes.data?.data ?? []
      store.semesters = semesterRes.data?.data ?? []
    } catch (err: unknown) {
      toast.error(
        getIndonesianErrorMessage(err, 'Gagal memuat data referensi.'),
      )
    }
  },

  fetchAll: async () => {
    const store = useStudentScoreStore()
    if (
      !store.selectedClassroomId ||
      !store.selectedSubjectId ||
      !store.selectedSemesterId
    ) {
      store.items = []
      store.totalItems = 0
      store.teachingAssignment = null
      store.assessmentItems = []
      return
    }

    store.loading = true
    try {
      const taRes = await teachingAssignmentApi.getTeachingAssignments({
        classroomId: store.selectedClassroomId,
        subjectId: store.selectedSubjectId,
        semesterId: store.selectedSemesterId,
        limit: 1,
      })
      const assignments = taRes.data?.data ?? []

      if (assignments.length === 0) {
        store.teachingAssignment = null
        store.assessmentItems = []
        store.items = []
        store.totalItems = 0
        return
      }

      store.teachingAssignment = assignments[0] ?? null

      if (!store.teachingAssignment) return

      const assessmentRes = await assessmentItemApi.getAssessmentItems({
        teachingAssignmentId: store.teachingAssignment.id,
        limit: 100,
      })
      store.assessmentItems = assessmentRes.data?.data ?? []

      const enrollmentsRes = await studentEnrollmentApi.getEnrollments({
        classroomId: store.selectedClassroomId,
        semesterId: store.selectedSemesterId,
        limit: 100,
      })
      const enrollments = enrollmentsRes.data?.data ?? []

      const scorePromises = store.assessmentItems.map((item) =>
        studentScoreApi.getScores({ assessmentItemId: item.id, limit: 100 }),
      )
      const scoresResponses = await Promise.all(scorePromises)
      const allScores = scoresResponses.flatMap((res) => res.data?.data ?? [])

      const mergedItems: StudentScoreRow[] = enrollments.map(
        (enrollment: StudentEnrollment) => {
          const scoresForStudent = allScores.filter(
            (s: StudentScore) => s.enrollmentId === enrollment.id,
          )
          const scoreMap: Record<
            string,
            { id?: string; score: number | null; notes?: string | null }
          > = {}

          scoresForStudent.forEach((s: StudentScore) => {
            scoreMap[s.assessmentItemId] = {
              id: s.id,
              score: s.score,
              notes: s.notes,
            }
          })

          return {
            enrollmentId: enrollment.id,
            student: enrollment.student,
            scores: scoreMap,
          }
        },
      )

      store.items = mergedItems
      store.totalItems = mergedItems.length
    } catch (err: unknown) {
      toast.error(
        getIndonesianErrorMessage(err, 'Gagal memuat data nilai siswa.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveScores: async (
    scoresToSave: StudentScoreSavePayload[],
    scoresToUpdate: { id: string; payload: Partial<StudentScoreSavePayload> }[],
  ) => {
    const store = useStudentScoreStore()
    store.isSaving = true
    store.formError = null
    try {
      if (scoresToSave.length > 0) {
        await studentScoreApi.bulkSaveScores({ scores: scoresToSave })
      }

      if (scoresToUpdate.length > 0) {
        const updatePromises = scoresToUpdate.map((update) =>
          studentScoreApi.updateScore(update.id, update.payload),
        )
        await Promise.all(updatePromises)
      }

      return { success: true }
    } catch (err: unknown) {
      store.formError = getIndonesianErrorMessage(
        err,
        'Gagal menyimpan nilai siswa.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  saveAssessmentItem: async (payload: AssessmentItemSavePayload) => {
    try {
      await assessmentItemApi.createAssessmentItem(payload)
      return { success: true }
    } catch (err: unknown) {
      return {
        success: false,
        error: getIndonesianErrorMessage(
          err,
          'Gagal menyimpan komponen penilaian.',
        ),
      }
    }
  },

  deleteAssessmentItem: async (id: string) => {
    try {
      await assessmentItemApi.deleteAssessmentItem(id)
      return { success: true }
    } catch (err: unknown) {
      return {
        success: false,
        error: getIndonesianErrorMessage(
          err,
          'Gagal menghapus komponen penilaian.',
        ),
      }
    }
  },
}
