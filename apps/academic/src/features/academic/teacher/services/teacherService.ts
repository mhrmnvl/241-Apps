import { teacherApi } from '../api/teacherApi'
import { useTeacherStore } from '../stores/teacherStore'
import type {
  TeacherQueryParams,
  TeacherExportParams,
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherPositionSavePayload,
  TeacherPositionUpdatePayload,
} from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const teacherService = {
  fetchTeachers: async () => {
    const store = useTeacherStore()
    store.loading = true
    try {
      const params: TeacherQueryParams = { page: 1, limit: 100 }
      if (store.filters.keyword.trim())
        params.search = store.filters.keyword.trim()

      const res = await teacherApi.getTeachers(params)
      store.teachers = res.data.data
      store.totalTeachers = res.data.meta?.total ?? res.data.data.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pegawai.'),
      )
    } finally {
      store.loading = false
    }
  },

  fetchPositions: async () => {
    const store = useTeacherStore()
    try {
      const res = await teacherApi.getPositions({ limit: 100, isActive: true })
      store.positions = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data jabatan.'),
      )
    }
  },

  saveTeacher: async (
    id: string | null,
    payload: TeacherSavePayload | TeacherUpdatePayload,
  ) => {
    const store = useTeacherStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await teacherApi.updateTeacher(id, payload)
      } else {
        await teacherApi.createTeacher(payload as TeacherSavePayload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data pegawai.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteTeacher: async (id: string) => {
    return teacherApi.deleteTeacher(id)
  },

  toggleActive: async (id: string, isActive: boolean) => {
    return teacherApi.toggleActive(id, isActive)
  },

  exportTeachers: async () => {
    const store = useTeacherStore()
    const params: TeacherExportParams = {}
    if (store.filters.keyword.trim())
      params.search = store.filters.keyword.trim()
    return teacherApi.exportTeachers(params)
  },

  getImportTemplate: async () => {
    return teacherApi.getImportTemplate()
  },

  bulkImport: async (file: File) => {
    return teacherApi.bulkImport(file)
  },

  savePosition: async (
    teacherId: string,
    payload: TeacherPositionSavePayload | TeacherPositionUpdatePayload,
    editingItem?: { id: string },
  ) => {
    const store = useTeacherStore()
    store.isSavingPosition = true
    try {
      if (editingItem) {
        await teacherApi.updatePosition(teacherId, editingItem.id, payload)
        toast.success('Jabatan berhasil diperbarui')
      } else {
        await teacherApi.createPosition(
          teacherId,
          payload as TeacherPositionSavePayload,
        )
        toast.success('Jabatan berhasil ditambahkan')
      }
      return { success: true }
    } catch (error: unknown) {
      toast.error('Gagal menyimpan jabatan', {
        description: getIndonesianErrorMessage(error, 'Terjadi kesalahan.'),
      })
      return { success: false }
    } finally {
      store.isSavingPosition = false
    }
  },

  deletePosition: async (teacherId: string, positionId: string) => {
    try {
      await teacherApi.deletePosition(teacherId, positionId)
      toast.success('Riwayat jabatan berhasil dihapus')
      return { success: true }
    } catch (error: unknown) {
      toast.error('Gagal menghapus jabatan', {
        description: getIndonesianErrorMessage(error, 'Terjadi kesalahan.'),
      })
      return { success: false }
    }
  },

  getPositionsList: async () => {
    try {
      const res = await teacherApi.getPositions({ limit: 100, isActive: true })
      const raw = res.data?.data ?? []
      return Array.isArray(raw) ? raw : []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data jabatan.'),
      )
      return []
    }
  },

  changePassword: async (payload: { userId: string; password: string }) => {
    const { accountService } = await import('@/features/platform/auth')
    return accountService.changePassword(payload.userId, {
      password: payload.password,
    })
  },
}
