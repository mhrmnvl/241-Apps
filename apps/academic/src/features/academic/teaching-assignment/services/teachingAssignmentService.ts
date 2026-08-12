import { teachingAssignmentApi } from '../api/teachingAssignmentApi'
import { useTeachingAssignmentStore } from '../stores/teachingAssignmentStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
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
  const curriculaRes = await curriculumApi.getCurricula({ isActive: true })
  const activeCurriculum = (curriculaRes.data?.data ?? []).find(
    (c) => c.isActive,
  )

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
      const [classroomRes, teacherRes, subjects] = await Promise.all([
        classroomApi.getClassrooms({ limit: PAGINATION.REFERENCE_LIMIT }),
        teacherApi.getTeachers({ limit: PAGINATION.REFERENCE_LIMIT }),
        fetchAssignableSubjects(),
      ])
      store.classrooms = classroomRes.data?.data ?? []
      store.subjects = subjects
      store.teachers = teacherRes.data?.data ?? []
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
        ...(store.selectedClassroomId
          ? { classroomId: store.selectedClassroomId }
          : {}),
      }

      const res = await teachingAssignmentApi.getTeachingAssignments(params)
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
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
