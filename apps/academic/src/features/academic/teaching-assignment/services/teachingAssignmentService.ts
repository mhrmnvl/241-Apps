import { teachingAssignmentApi } from '../api/teachingAssignmentApi'
import { useTeachingAssignmentStore } from '../stores/teachingAssignmentStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { classroomApi } from '@/features/academic/classroom'
import { subjectApi } from '@/features/academic/subject'
import { semesterApi } from '@/features/academic/semester'
import { teacherApi } from '@/features/academic/teacher'
import type {
  TeachingAssignmentCreatePayload,
  TeachingAssignmentUpdatePayload,
  TeachingAssignmentQueryParams,
} from '../types'

export const teachingAssignmentService = {
  fetchFilterOptions: async () => {
    const store = useTeachingAssignmentStore()
    try {
      const [classroomRes, subjectRes, semesterRes, teacherRes] =
        await Promise.all([
          classroomApi.getClassrooms({ limit: 100 }),
          subjectApi.getSubjects({ limit: 100 }),
          semesterApi.getSemesters({ limit: 100 }),
          teacherApi.getTeachers({ limit: 100 }),
        ])
      store.classrooms = classroomRes.data?.data ?? []
      store.subjects = subjectRes.data?.data ?? []
      store.semesters = semesterRes.data?.data ?? []
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
        limit: 100,
        ...(store.selectedSemesterId
          ? { semesterId: store.selectedSemesterId }
          : {}),
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
