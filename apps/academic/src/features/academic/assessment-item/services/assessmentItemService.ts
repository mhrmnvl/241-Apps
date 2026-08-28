import { assessmentItemApi } from '../api/assessmentItemApi'
import type { AssessmentItemSavePayload } from '../types'
import { useAssessmentItemStore } from '../stores/assessmentItemStore'
import { classroomApi } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { subjectApi } from '@/features/academic/subject'
import { loadAssignments } from '@/features/academic/teaching-assignment'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'

export const assessmentItemService = {
  /**
   * What the screen opens on, rather than what it asks for.
   *
   * A teacher arrives here to write a task for the class they are about to
   * teach, in the term the school is in. Two of those three are already known:
   * the active semester is the school's, and the subject is theirs. Asking for
   * either was asking somebody to restate what the system knows, with a chance
   * of picking the wrong one — a task filed under last term is not obviously
   * wrong on screen.
   *
   * The class stays a question, because a teacher takes the same subject across
   * several of them and only they know which one this task is for.
   */
  fetchRelatedData: async () => {
    const store = useAssessmentItemStore()

    try {
      const [classroomRes, subjectRes, semesterRes] = await Promise.all([
        classroomApi.getClassrooms({ limit: PAGINATION.REFERENCE_LIMIT }),
        subjectApi.getSubjects({ limit: PAGINATION.REFERENCE_LIMIT }),
        semesterApi.getSemesters({ limit: PAGINATION.REFERENCE_LIMIT }),
      ])
      const allClassrooms = classroomRes.data?.data ?? []
      const allSubjects = subjectRes.data?.data ?? []
      store.semesters = semesterRes.data?.data ?? []

      // The term the school is in. `??=` so a choice already made survives a
      // reload of the reference data.
      store.selectedSemesterId ??=
        store.semesters.find((semester) => semester.isActive)?.id ?? null

      // The assignments the viewer may write under, in the term on screen.
      //
      // Whoever grades the whole school gets all of them; a teacher gets their
      // own. Decided by permission, because a role name says nothing — this
      // school has a role called `Wali Kelas` whose holder is a teacher like
      // any other.
      const { rows: assignments } = await loadAssignments({
        ...(store.selectedSemesterId
          ? { semesterId: store.selectedSemesterId }
          : {}),
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.assignments = assignments

      // The reference lists are kept whole and the filters read through them
      // for labels — an assignment names a classroom by `name` where the filter
      // shows `code`. Which of them is *offered* is `assignments`' business,
      // and the view works that out per selection so the two filters agree.
      const subjectIds = new Set(assignments.map((a) => a.subjectId))
      const classroomIds = new Set(assignments.map((a) => a.classroomId))
      store.subjects = allSubjects.filter((subject) =>
        subjectIds.has(subject.id),
      )
      store.classrooms = allClassrooms.filter((classroom) =>
        classroomIds.has(classroom.id),
      )

      // One of anything is not a question. A teacher of one subject should not
      // be asked which subject; one who teaches two still has to say.
      if (store.classrooms.length === 1) {
        store.selectedClassroomId ??= store.classrooms[0].id
      }
      if (store.subjects.length === 1) {
        store.selectedSubjectId ??= store.subjects[0].id
      }
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
      // school asks about all of them.
      const query = {
        classroomId: store.selectedClassroomId,
        subjectId: store.selectedSubjectId,
        semesterId: store.selectedSemesterId,
        limit: 1,
      }
      const { rows: assignments } = await loadAssignments(query)

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
