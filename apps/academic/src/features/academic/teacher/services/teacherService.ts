import { teacherApi } from '../api/teacherApi'
import { PAGINATION } from '@/shared/constants/pagination'
import { addressApi } from '@/features/platform/address'
import { useTeacherStore } from '../stores/teacherStore'
import { positionCategoryApi } from '../../position-category/api/positionCategoryApi'
import type {
  TeacherQueryParams,
  TeacherExportParams,
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherPositionSavePayload,
  TeacherPositionUpdatePayload,
  CreateTeacherWithRelationsInput,
  CreateTeacherWithRelationsResult,
  ResolveBulkImportConflict,
} from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { useReferenceList } from '@/features/platform/reference-data'

export const teacherService = {
  fetchTeachers: async () => {
    const store = useTeacherStore()
    store.loading = true
    try {
      const params: TeacherQueryParams = {
        page: store.currentPage,
        limit: store.pageSize,
      }
      if (store.filters.keyword.trim())
        params.search = store.filters.keyword.trim()
      // TeacherListView uses positionCategoryId; TeacherAccountView uses categoryFilter
      const categoryId =
        store.filters.positionCategoryId ||
        (store.filters.categoryFilter !== 'all'
          ? store.filters.categoryFilter
          : '')
      if (categoryId) params.positionCategoryId = categoryId
      const statusFilter = store.filters.statusFilter
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active'

      const res = await teacherApi.getTeachers(params)
      store.teachers = res.data.data
      store.totalTeachers = res.data.meta?.total ?? res.data.data.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data guru.'))
    } finally {
      store.loading = false
    }
  },

  fetchPositions: async () => {
    const store = useTeacherStore()
    try {
      const res = await teacherApi.getPositions({
        limit: PAGINATION.REFERENCE_LIMIT,
        isActive: true,
      })
      store.positions = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data jabatan.'),
      )
    }
  },

  fetchPositionCategories: async () => {
    const store = useTeacherStore()
    try {
      const res = await positionCategoryApi.getPositionCategories({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.positionCategories = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat kategori jabatan.'),
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
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('teachers')
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data guru.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  createTeacherWithRelations: async (
    input: CreateTeacherWithRelationsInput,
  ): Promise<CreateTeacherWithRelationsResult> => {
    const store = useTeacherStore()
    store.isSaving = true
    store.formError = null
    const warnings: string[] = []
    try {
      const res = await teacherApi.createTeacher(input.core)
      const teacher = res.data.data
      const teacherId = teacher.id
      const userId = teacher.user?.id

      if (input.address && userId) {
        try {
          await addressApi.createAddressForUser(userId, input.address)
        } catch (error: unknown) {
          warnings.push(
            getIndonesianErrorMessage(error, 'Alamat gagal disimpan.'),
          )
        }
      }

      for (const position of input.positions ?? []) {
        try {
          await teacherApi.createPosition(teacherId, {
            positionId: position.positionId,
            hireDate: position.hireDate,
            isPrimary: position.isPrimary,
          })
        } catch (error: unknown) {
          warnings.push(
            getIndonesianErrorMessage(
              error,
              'Sebagian jabatan gagal disimpan.',
            ),
          )
        }
      }

      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('teachers')
      return { success: true, teacherId, userId, warnings }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan data guru.',
      )
      return { success: false, warnings }
    } finally {
      store.isSaving = false
    }
  },

  deleteTeacher: async (id: string) => {
    const result = await teacherApi.deleteTeacher(id)
    useReferenceList().invalidate('teachers')
    return result
  },

  toggleActive: async (id: string, isActive: boolean) => {
    const result = await teacherApi.toggleActive(id, isActive)
    useReferenceList().invalidate('teachers')
    return result
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
    const result = await teacherApi.bulkImport(file)
    useReferenceList().invalidate('teachers')
    return result
  },

  resolveBulkImportConflicts: async (
    conflicts: ResolveBulkImportConflict[],
  ) => {
    const result = await teacherApi.resolveBulkImportConflicts(conflicts)
    useReferenceList().invalidate('teachers')
    return result
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
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('teachers')
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
      // The list this screen picks from is now out of date.
      useReferenceList().invalidate('teachers')
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
      const res = await teacherApi.getPositions({
        limit: PAGINATION.REFERENCE_LIMIT,
        isActive: true,
      })
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
