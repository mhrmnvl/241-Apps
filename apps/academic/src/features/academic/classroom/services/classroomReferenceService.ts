import { useClassroomStore } from '../stores/classroomStore'
import { academicYearApi } from '@/features/academic/academic-year'
import { curriculaApi } from '@/features/academic/curriculum'
import { teacherApi } from '@/features/academic/teacher'
import { gradeApi } from '@/features/academic/grade'
import { semesterApi } from '@/features/academic/semester'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const classroomReferenceService = {
  fetchCurricula: async () => {
    const store = useClassroomStore()
    try {
      const res = await curriculaApi.getCurricula({ limit: 100 })
      store.curricula = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data kurikulum.'),
      )
    }
  },

  fetchAcademicYears: async () => {
    const store = useClassroomStore()
    try {
      const res = await academicYearApi.getAcademicYears({ limit: 100 })
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
      const res = await gradeApi.getGrades({ limit: 100 })
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
      const res = await teacherApi.getTeachers({ limit: 100 })
      store.teachers = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data guru.'))
    }
  },

  fetchSemesters: async () => {
    const store = useClassroomStore()
    try {
      const res = await semesterApi.getSemesters({ limit: 100 })
      store.semesters = res.data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data semester.'),
      )
    }
  },
}
