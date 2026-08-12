import { useClassroomStore } from '../stores/classroomStore'
import { academicYearApi } from '@/features/academic/academic-year'
import { teacherApi } from '@/features/academic/teacher'
import { gradeApi } from '@/features/academic/grade'
import { semesterApi } from '@/features/academic/semester'
import { useReferenceList } from '@/features/platform/reference-data'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'

/**
 * The lists the classroom screens pick from, read through the session cache.
 *
 * Each of these was requested again on every visit and on every reload after a
 * save — the manage screen alone asked for four of them per `reloadData()`.
 * They are whole lists, unfiltered and unpaginated, which is what makes them
 * safe to hold under one key.
 *
 * `classroomService.fetchClassrooms` is deliberately not here: it is paginated
 * and filtered, so two different filters would collide on one key and serve
 * each other's rows.
 */
export const classroomReferenceService = {
  fetchAcademicYears: async () => {
    const store = useClassroomStore()
    try {
      store.academicYears = await useReferenceList().read(
        'academicYears',
        async () => {
          const res = await academicYearApi.getAcademicYears({
            limit: PAGINATION.REFERENCE_LIMIT,
          })
          return res.data.data ?? []
        },
      )
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tahun ajaran.'),
      )
    }
  },

  fetchGrades: async () => {
    const store = useClassroomStore()
    try {
      store.grades = await useReferenceList().read('grades', async () => {
        const res = await gradeApi.getGrades({
          limit: PAGINATION.REFERENCE_LIMIT,
        })
        return res.data.data ?? []
      })
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tingkat kelas.'),
      )
    }
  },

  fetchTeachers: async () => {
    const store = useClassroomStore()
    try {
      store.teachers = await useReferenceList().read('teachers', async () => {
        const res = await teacherApi.getTeachers({
          limit: PAGINATION.REFERENCE_LIMIT,
        })
        return res.data.data ?? []
      })
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data guru.'))
    }
  },

  fetchSemesters: async () => {
    const store = useClassroomStore()
    try {
      store.semesters = await useReferenceList().read('semesters', async () => {
        const res = await semesterApi.getSemesters({
          limit: PAGINATION.REFERENCE_LIMIT,
        })
        return res.data.data ?? []
      })
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data semester.'),
      )
    }
  },
}
