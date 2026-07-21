import { studentApi } from '../api/studentApi'
import { classroomApi } from '@/features/academic/classroom'
import { parentApi } from '@/features/academic/parent'
import { studentParentApi } from '@/features/academic/student-parent'
import { addressApi } from '@/features/platform/address'
import { useStudentStore } from '../stores/studentStore'
import type {
  StudentQueryParams,
  StudentExportParams,
  StudentSavePayload,
  StudentUpdatePayload,
  StudentAccountUpdatePayload,
  CreateStudentWithRelationsInput,
  CreateStudentWithRelationsResult,
} from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import api from '@/shared/utils/api'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import type { GradeOption } from '../types'

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

  fetchClassrooms: async (gradeId?: string) => {
    const store = useStudentStore()
    try {
      const res = await classroomApi.getClassrooms({
        limit: 100,
        isActive: true,
        ...(gradeId && gradeId !== 'all' ? { gradeId } : {}),
      })
      store.classrooms = res.data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data kelas.'))
    }
  },

  fetchGrades: async () => {
    const store = useStudentStore()
    try {
      const res = await api.get<ApiPaginatedResponse<GradeOption>>('/grades', {
        params: { limit: 100, isActive: true },
      })
      store.grades = res.data.data
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

  createStudentWithRelations: async (
    input: CreateStudentWithRelationsInput,
  ): Promise<CreateStudentWithRelationsResult> => {
    const store = useStudentStore()
    store.isSaving = true
    store.formError = null
    const warnings: string[] = []
    try {
      const res = await studentApi.createStudent(input.core)
      const created = res.data.data
      const studentId = created.id
      const userId = created.userId

      if (input.address) {
        try {
          await addressApi.createAddressForUser(userId, input.address)
        } catch (error: unknown) {
          warnings.push(
            getIndonesianErrorMessage(error, 'Alamat gagal disimpan.'),
          )
        }
      }

      for (const parent of input.parents ?? []) {
        try {
          const parentRes = await parentApi.createParent({
            name: parent.name,
            nik: parent.nik,
            birthPlace: parent.birthPlace,
            birthDate: parent.birthDate,
            email: parent.email ?? undefined,
            phone: parent.phone ?? undefined,
            occupationId: parent.occupationId,
            income: parent.income,
          })
          await studentParentApi.create({
            studentId,
            parentId: parentRes.data.data.id,
            relation: parent.relation,
            isPrimary: parent.isPrimary,
          })
        } catch (error: unknown) {
          warnings.push(
            getIndonesianErrorMessage(
              error,
              `Data orang tua "${parent.name}" gagal disimpan.`,
            ),
          )
        }
      }

      return { success: true, studentId, userId, warnings }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data siswa.',
      )
      return { success: false, warnings }
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
    payload: StudentAccountUpdatePayload,
    userId?: string,
    currentIsActive?: boolean,
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
