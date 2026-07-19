import { subjectApi } from '../api/subjectApi'
import { useSubjectStore } from '../stores/subjectStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { teacherApi } from '@/features/academic/teacher'
import { toast } from 'vue-sonner'
import type { SubjectSavePayload } from '../types'

export const subjectService = {
  fetchSubjects: async () => {
    const store = useSubjectStore()
    store.loading = true
    try {
      const res = await subjectApi.getSubjects({ limit: 100 })
      store.subjects = res.data.data ?? []
      store.totalSubjects = res.data.meta?.total ?? store.subjects.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data mata pelajaran.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveSubject: async (id: string | null, payload: SubjectSavePayload) => {
    const store = useSubjectStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await subjectApi.updateSubject(id, payload)
        toast.success('Berhasil memperbarui mata pelajaran')
      } else {
        await subjectApi.createSubject(payload)
        toast.success('Berhasil menambah mata pelajaran')
      }
      await subjectService.fetchSubjects()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan mata pelajaran.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteSubject: async (id: string) => {
    try {
      await subjectApi.deleteSubject(id)
      toast.success('Mata pelajaran berhasil dihapus')
      await subjectService.fetchSubjects()
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        error,
        'Gagal menghapus mata pelajaran.',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  fetchTeachers: async () => {
    const res = await teacherApi.getTeachers({ limit: 100 })
    return res.data?.data ?? []
  },
}
