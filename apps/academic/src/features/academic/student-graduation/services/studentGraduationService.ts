import { studentGraduationApi } from '../api/studentGraduationApi'
import { useStudentGraduationStore } from '../stores/studentGraduationStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { studentApi } from '@/features/academic/student'
import { academicYearApi } from '@/features/academic/academic-year'
import type { StudentGraduationSavePayload } from '../types'

export const studentGraduationService = {
  fetchReferenceData: async () => {
    const store = useStudentGraduationStore()
    try {
      const [studentRes, academicYearRes] = await Promise.all([
        studentApi.getStudents({
          limit: PAGINATION.REFERENCE_LIMIT,
          status: 'ACTIVE',
        }),
        academicYearApi.getAcademicYears({ limit: PAGINATION.REFERENCE_LIMIT }),
      ])
      store.students = studentRes.data?.data ?? []
      store.academicYears = academicYearRes.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data referensi.'),
      )
    }
  },

  fetchStudentGraduations: async () => {
    const store = useStudentGraduationStore()
    store.loading = true
    try {
      const res = await studentGraduationApi.getStudentGraduations({
        page: store.currentPage,
        limit: store.pageSize,
        ...(store.selectedAcademicYearId
          ? { academicYearId: store.selectedAcademicYearId }
          : {}),
      })
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data kelulusan siswa.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveStudentGraduation: async (
    id: string | null,
    payload: StudentGraduationSavePayload,
  ) => {
    const store = useStudentGraduationStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await studentGraduationApi.updateStudentGraduation(id, payload)
        toast.success('Data kelulusan berhasil diperbarui')
      } else {
        await studentGraduationApi.createStudentGraduation(payload)
        toast.success('Data kelulusan berhasil ditambahkan')
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data kelulusan.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteStudentGraduation: async (id: string) => {
    try {
      await studentGraduationApi.deleteStudentGraduation(id)
      toast.success('Data kelulusan berhasil dihapus')
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        error,
        'Gagal menghapus data kelulusan.',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },
}
