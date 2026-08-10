import { useClassroomStore } from '../stores/classroomStore'
import { academicYearApi } from '@/features/academic/academic-year'
import { teacherApi } from '@/features/academic/teacher'
import { gradeApi } from '@/features/academic/grade'
import { semesterApi } from '@/features/academic/semester'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'

export const classroomReferenceService = {
  fetchAcademicYears: async () => {
    const store = useClassroomStore()
    try {
      const res = await academicYearApi.getAcademicYears({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.academicYears = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tahun ajaran.'),
      )
    }
  },

  fetchGrades: async () => {
    const store = useClassroomStore()
    try {
      const res = await gradeApi.getGrades({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.grades = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data tingkat kelas.'),
      )
    }
  },

  fetchTeachers: async () => {
    const store = useClassroomStore()
    try {
      const res = await teacherApi.getTeachers({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.teachers = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data guru.'))
    }
  },

  fetchSemesters: async () => {
    const store = useClassroomStore()
    try {
      const res = await semesterApi.getSemesters({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.semesters = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data semester.'),
      )
    }
  },
}
