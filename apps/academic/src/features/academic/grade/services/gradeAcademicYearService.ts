import { gradeAcademicYearApi } from '../api/gradeAcademicYearApi'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type { AssignCurriculumPayload } from '../types'

export const gradeAcademicYearService = {
  getAssignments: async (academicYearId?: string) => {
    const res = await gradeAcademicYearApi.getAssignments(academicYearId)
    return res.data?.data ?? []
  },

  assign: async (payload: AssignCurriculumPayload) => {
    try {
      await gradeAcademicYearApi.assign(payload)
      toast.success('Kurikulum berhasil ditetapkan ke tingkat kelas')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(
        error,
        'Gagal menetapkan kurikulum.',
      )
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  remove: async (id: string) => {
    try {
      await gradeAcademicYearApi.remove(id)
      toast.success('Penetapan kurikulum berhasil dihapus')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(error, 'Gagal menghapus penetapan.')
      toast.error(msg)
      return { success: false, error: msg }
    }
  },
}
