import { studentApi } from '../api/studentApi'
import { classroomApi } from '@/features/academic/classroom'
import { useStudentStore } from '../stores/studentStore'
import type {
  StudentQueryParams,
  StudentExportParams,
  StudentSavePayload,
  StudentUpdatePayload,
  StudentAccountUpdatePayload,
} from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import api from '@/shared/utils/api'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import type { ClassroomLevelOption } from '../types'

export const studentService = {
  fetchStudents: async () => {
    const store = useStudentStore()
    store.loading = true
    try {
      const params: StudentQueryParams = { page: 1, limit: 100 }
      if (store.filters.keyword.trim())
        params.search = store.filters.keyword.trim()
      if (store.filters.classroomId !== 'all')
        params.classroomId = store.filters.classroomId

      const res = await studentApi.getStudents(params)
      store.students = res.data.data
      store.totalStudents = res.data.meta?.total ?? res.data.data.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data siswa.'))
    } finally {
      store.loading = false
    }
  },

  fetchClassrooms: async (classroomLevelId?: string) => {
    const store = useStudentStore()
    try {
      const res = await classroomApi.getClassrooms({
        limit: 100,
        isActive: true,
        ...(classroomLevelId && classroomLevelId !== 'all'
          ? { classroomLevelId }
          : {}),
      })
      store.classrooms = res.data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data kelas.'))
    }
  },

  fetchClassroomLevels: async () => {
    const store = useStudentStore()
    try {
      const res = await api.get<ApiPaginatedResponse<ClassroomLevelOption>>(
        '/classroom-levels',
        { params: { limit: 100, isActive: true } },
      )
      store.classroomLevels = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat tingkat kelas.'),
      )
    }
  },

  saveStudent: async (
    id: string | null,
    payload: StudentSavePayload | StudentUpdatePayload,
  ) => {
    const store = useStudentStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await studentApi.updateStudentAccount(id, payload)
      } else {
        await studentApi.createStudent(payload as StudentSavePayload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data siswa.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  exportStudents: async () => {
    const store = useStudentStore()
    const params: StudentExportParams = {}
    if (store.filters.keyword.trim())
      params.search = store.filters.keyword.trim()
    if (store.filters.classroomId !== 'all')
      params.classroomId = store.filters.classroomId
    return studentApi.exportStudents(params)
  },

  getImportTemplate: async () => {
    return studentApi.getImportTemplate()
  },

  bulkImport: async (file: File) => {
    return studentApi.bulkImport(file)
  },

  updateStudentAccount: async (id: string, payload: StudentUpdatePayload) => {
    return studentApi.updateStudentAccount(id, payload)
  },

  deleteStudent: async (id: string) => {
    return studentApi.deleteStudent(id)
  },

  toggleActive: async (id: string, isActive: boolean) => {
    return studentApi.toggleActive(id, isActive)
  },

  updateStudentCredentials: async (
    studentId: string,
    userId: string | undefined,
    payload: StudentAccountUpdatePayload,
    currentIsActive: boolean | undefined,
  ) => {
    if (payload.isActive !== currentIsActive) {
      await studentApi.toggleActive(studentId, payload.isActive)
    }

    if (payload.password && userId) {
      const { accountService } = await import('@/features/platform/auth')
      await accountService.changePassword(userId, {
        password: payload.password,
      })
    }
  },
}
