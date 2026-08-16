import { assessmentItemApi } from '../api/assessmentItemApi'
import type { AssessmentItemSavePayload } from '../types'
import { useAssessmentItemStore } from '../stores/assessmentItemStore'
import { classroomApi } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { subjectApi } from '@/features/academic/subject'
import { teachingAssignmentApi } from '@/features/academic/teaching-assignment'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/features/platform/auth'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'

export const assessmentItemService = {
  fetchRelatedData: async () => {
    const store = useAssessmentItemStore()
    try {
      const [classroomRes, subjectRes, semesterRes] = await Promise.all([
        classroomApi.getClassrooms({ limit: PAGINATION.REFERENCE_LIMIT }),
        subjectApi.getSubjects({ limit: PAGINATION.REFERENCE_LIMIT }),
        semesterApi.getSemesters({ limit: PAGINATION.REFERENCE_LIMIT }),
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
      // A teacher asks about their own assignments; whoever grades the whole
      // school asks about all of them. Decided by permission, because a role
      // name says nothing — the school has named a role `Wali Kelas` and that
      // person is a teacher like any other.
      const { can } = useRoleGuard()
      const query = {
        classroomId: store.selectedClassroomId,
        subjectId: store.selectedSubjectId,
        semesterId: store.selectedSemesterId,
        limit: 1,
      }
      const taRes = can('teaching-assignments.read')
        ? await teachingAssignmentApi.getTeachingAssignments(query)
        : await teachingAssignmentApi.getMyTeachingAssignments(query)
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
        limit: PAGINATION.CHILD_ENTITY_LIMIT,
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
