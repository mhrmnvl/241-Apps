import { teachingAssignmentApi } from '../api/teachingAssignmentApi'
import { loadAssignments } from './loadAssignments'
import { useTeachingAssignmentStore } from '../stores/teachingAssignmentStore'
import { isEveryClassroom } from '../constants/filters'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { useReferenceList } from '@/features/platform/reference-data'
import { classroomApi } from '@/features/academic/classroom'
import { subjectApi } from '@/features/academic/subject'
import { teacherApi } from '@/features/academic/teacher'
import { curriculumApi } from '@/features/academic/curriculum'
import { curriculumSubjectApi } from '@/features/academic/curriculum-subject'
import type {
  TeachingAssignmentCreatePayload,
  TeachingAssignmentUpdatePayload,
  TeachingAssignmentQueryParams,
  TeachingAssignmentSubjectOption,
} from '../types'

/**
 * Subjects a teacher may be assigned to teach.
 *
 * Only what the active curriculum lists counts: assigning a subject outside it
 * would record teaching that the curriculum does not contain. When no
 * curriculum is active there is nothing to narrow by, so the full subject list
 * is used rather than showing an empty dropdown the user cannot act on.
 */
async function fetchAssignableSubjects(): Promise<
  TeachingAssignmentSubjectOption[]
> {
  // A teacher may read this page but not the curriculum register, and a
  // refusal here means the same thing to this function as no active curriculum
  // does: there is nothing to narrow the subject list by. Letting it throw
  // took the whole reference load down with it — the class filter came up
  // empty and the screen said only that something had failed.
  const activeCurriculum = await curriculumApi
    .getCurricula({ isActive: true })
    .then((res) => (res.data?.data ?? []).find((c) => c.isActive))
    .catch(() => undefined)

  if (!activeCurriculum) {
    const subjectRes = await subjectApi.getSubjects({
      limit: PAGINATION.REFERENCE_LIMIT,
    })
    return subjectRes.data?.data ?? []
  }

  const curriculumSubjectRes = await curriculumSubjectApi.getCurriculumSubjects(
    {
      curriculumId: activeCurriculum.id,
      limit: PAGINATION.REFERENCE_LIMIT,
    },
  )

  return (curriculumSubjectRes.data?.data ?? [])
    .map((cs) => cs.subject)
    .filter((s): s is NonNullable<typeof s> => s != null)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const teachingAssignmentService = {
  fetchFilterOptions: async () => {
    const store = useTeachingAssignmentStore()
    try {
      // Subjects need a second round trip to resolve the active curriculum,
      // so they run alongside the two flat lists rather than after them.
      //
      // The two flat lists are cached for the session; the subjects are not.
      // They are narrowed by whichever curriculum is active, so one key would
      // hold one curriculum's answer and serve it to the next.
      const [classrooms, teachers, subjects] = await Promise.all([
        useReferenceList().read('classrooms', async () => {
          const res = await classroomApi.getClassrooms({
            limit: PAGINATION.REFERENCE_LIMIT,
          })
          return res.data?.data ?? []
        }),
        useReferenceList().read('teachers', async () => {
          const res = await teacherApi.getTeachers({
            limit: PAGINATION.REFERENCE_LIMIT,
          })
          return res.data?.data ?? []
        }),
        fetchAssignableSubjects(),
      ])
      store.classrooms = classrooms
      store.subjects = subjects
      store.teachers = teachers
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data referensi.'),
      )
    }
  },

  fetchTeachingAssignments: async () => {
    const store = useTeachingAssignmentStore()
    store.loading = true
    try {
      const params: TeachingAssignmentQueryParams = {
        page: store.currentPage,
        limit: store.pageSize,
        // "Semua Kelas" is a screen-level sentinel, not a classroom id. It
        // used to be forwarded as one, and the server validates `classroomId`
        // as a UUID — so the default view of this page asked for everything
        // and got a 400.
        ...(isEveryClassroom(store.selectedClassroomId)
          ? {}
          : { classroomId: store.selectedClassroomId }),
      }

      // Their own teaching where that is all they may see, the school's
      // where they assign it. A teacher opening this page used to be refused
      // outright: the list asked the wide endpoint, which their role does not
      // reach, so the screen that shows what they teach was the one screen
      // they could not open.
      const { rows, total } = await loadAssignments(params)
      store.items = rows
      store.totalItems = total
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal memuat data penugasan mengajar.',
        ),
      )
    } finally {
      store.loading = false
    }
  },

  saveTeachingAssignment: async (
    id: string | null,
    payload: TeachingAssignmentCreatePayload | TeachingAssignmentUpdatePayload,
  ) => {
    const store = useTeachingAssignmentStore()
    store.isSaving = true
    store.formError = null
    try {
      const { teacherId, subjectId, semesterId } = payload

      if (id) {
        // Narrowed rather than asserted, so a create-shaped payload can never
        // leak `classroomIds` into an update request.
        await teachingAssignmentApi.updateTeachingAssignment(id, {
          teacherId,
          subjectId,
          semesterId,
          ...('classroomId' in payload
            ? { classroomId: payload.classroomId }
            : {}),
        })
        toast.success('Berhasil memperbarui penugasan mengajar')
      } else {
        const res = await teachingAssignmentApi.createTeachingAssignment({
          teacherId,
          subjectId,
          semesterId,
          classroomIds: 'classroomIds' in payload ? payload.classroomIds : [],
        })
        const { created = [], skipped = [] } = res.data?.data ?? {}
        // Partial success is expected when some classes were already covered,
        // so say what actually happened instead of a flat "berhasil".
        toast.success(
          skipped.length > 0
            ? `${created.length} kelas ditambahkan, ${skipped.length} dilewati (sudah ada).`
            : `Berhasil menambah penugasan untuk ${created.length} kelas`,
        )
      }
      await teachingAssignmentService.fetchTeachingAssignments()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan penugasan mengajar.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteTeachingAssignment: async (id: string) => {
    try {
      await teachingAssignmentApi.deleteTeachingAssignment(id)
      toast.success('Penugasan mengajar berhasil dihapus')
      await teachingAssignmentService.fetchTeachingAssignments()
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        error,
        'Gagal menghapus penugasan mengajar.',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },
}
