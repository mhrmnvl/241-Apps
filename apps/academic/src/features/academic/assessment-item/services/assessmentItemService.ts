import { assessmentItemApi } from '../api/assessmentItemApi'
import type { AssessmentItemSavePayload } from '../types'
import { useAssessmentItemStore } from '../stores/assessmentItemStore'
import { classroomApi } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { subjectApi } from '@/features/academic/subject'
import { teachingAssignmentApi } from '@/features/academic/teaching-assignment'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const assessmentItemService = {
  fetchRelatedData: async () => {
    const store = useAssessmentItemStore()
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

  fetchItems: async () => {
    const store = useAssessmentItemStore()
    if (
      !store.selectedClassroomId ||
      !store.selectedSubjectId ||
      !store.selectedSemesterId
    ) {
      store.items = []
      store.totalItems = 0
      store.teachingAssignment = null
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
        store.items = []
        store.totalItems = 0
        return
      }

      store.teachingAssignment = assignments[0] ?? null
      if (!store.teachingAssignment) return

      const itemsRes = await assessmentItemApi.getAssessmentItems({
        teachingAssignmentId: store.teachingAssignment.id,
        limit: 100,
      })
      store.items = itemsRes.data?.data ?? []
      store.totalItems = store.items.length
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat daftar tugas.'))
    } finally {
      store.loading = false
    }
  },

  saveItem: async (payload: AssessmentItemSavePayload, id?: string) => {
    const store = useAssessmentItemStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await assessmentItemApi.updateAssessmentItem(id, payload)
      } else {
        await assessmentItemApi.createAssessmentItem(payload)
      }
      return { success: true }
    } catch (err: unknown) {
      store.formError = getIndonesianErrorMessage(err, 'Gagal menyimpan tugas.')
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteItem: async (id: string) => {
    try {
      await assessmentItemApi.deleteAssessmentItem(id)
      return { success: true }
    } catch (err: unknown) {
      return {
        success: false,
        error: getIndonesianErrorMessage(err, 'Gagal menghapus tugas.'),
      }
    }
  },
}
